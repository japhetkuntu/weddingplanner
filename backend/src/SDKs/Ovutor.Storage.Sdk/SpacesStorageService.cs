using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Options;
using Ovutor.Storage.Sdk.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace Ovutor.Storage.Sdk;

/// <summary>DigitalOcean Spaces and MinIO are both S3-compatible, so this uses AWSSDK.S3 pointed
/// at whichever endpoint the environment configures. Objects are written public-read so they can
/// be served directly (or via a CDN in front of Spaces) without a signed-URL round trip.</summary>
public sealed class SpacesStorageService(IAmazonS3 s3, IOptions<StorageSettings> options) : IStorageService
{
    private readonly StorageSettings _settings = options.Value;

    /// <summary>Photos are downscaled to fit within this box (preserving aspect ratio) — comfortably
    /// larger than any layout slot the wedding-website or admin-portal renders them at, so there's no
    /// visible quality loss, while still cutting a typical multi-MB camera photo down to a few hundred KB.</summary>
    private static readonly Size MaxPhotoDimensions = new(2400, 2400);
    private const int JpegQuality = 82;

    public async Task<string> UploadAsync(UploadFileRequest request, CancellationToken ct = default)
    {
        try
        {
            var isPhoto = request.OptimizeAsPhoto && request.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
            var key = BuildKey(_settings.RootFolder, request.Folder, request.OriginalFileName, isPhoto);
            var contentType = isPhoto ? "image/jpeg" : request.ContentType;

            await using var sourceStream = request.OpenContent();
            await using var uploadStream = isPhoto ? await OptimizePhotoAsync(sourceStream, ct) : sourceStream;

            var uploadRequest = new TransferUtilityUploadRequest
            {
                BucketName = _settings.BucketName,
                Key = key,
                InputStream = uploadStream,
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead,
                // Keys embed a random 12-char id and are never reused for different content, so
                // caching them forever at the browser/CDN is always safe.
                Headers = { CacheControl = "public, max-age=31536000, immutable" },
            };

            var transferUtility = new TransferUtility(s3);
            await transferUtility.UploadAsync(uploadRequest, ct);

            return key;
        }
        catch (AmazonS3Exception ex)
        {
            throw new StorageException("Failed to upload the file to storage.", ex);
        }
    }

    private static async Task<Stream> OptimizePhotoAsync(Stream source, CancellationToken ct)
    {
        using var image = await Image.LoadAsync(source, ct);
        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Mode = ResizeMode.Max,
            Size = MaxPhotoDimensions,
        }));

        var output = new MemoryStream();
        await image.SaveAsJpegAsync(output, new JpegEncoder { Quality = JpegQuality }, ct);
        output.Position = 0;
        return output;
    }

    public async Task DeleteAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await s3.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = key,
            }, ct);
        }
        catch (AmazonS3Exception ex)
        {
            throw new StorageException("Failed to delete the file from storage.", ex);
        }
    }

    public string BuildPublicUrl(string key)
    {
        var endpoint = _settings.CdnEndpoint.TrimEnd('/');
        return _settings.ForcePathStyle
            ? $"{endpoint}/{_settings.BucketName}/{key}"
            : $"{endpoint}/{key}";
    }

    // {rootFolder}/{folder}/{yyyy/MM/dd}/{12-char-guid}{ext} — rootFolder segment is
    // omitted entirely when unset, so a single-project bucket's keys are unaffected.
    private static string BuildKey(string rootFolder, string folder, string originalFileName, bool forceJpeg)
    {
        var datePart = DateTime.UtcNow.ToString("yyyy/MM/dd");
        var shortGuid = Guid.NewGuid().ToString("N")[..12];
        var ext = forceJpeg ? ".jpg" : Path.GetExtension(originalFileName).ToLowerInvariant();
        var trimmedRoot = rootFolder.Trim('/');
        var prefix = string.IsNullOrEmpty(trimmedRoot) ? folder : $"{trimmedRoot}/{folder}";
        return $"{prefix}/{datePart}/{shortGuid}{ext}";
    }
}
