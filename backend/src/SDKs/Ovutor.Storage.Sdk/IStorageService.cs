namespace Ovutor.Storage.Sdk;

/// <summary>Upload returns the generated object key only — never a URL. Callers store that key
/// and turn it into a public URL via <see cref="IStorageService.BuildPublicUrl"/> only when
/// serving it back to a client.
/// Key format: {Storage:RootFolder}/{folder}/{yyyy/MM/dd}/{12-char-guid}{ext} — the RootFolder
/// segment is omitted when unconfigured (see <see cref="Ovutor.Storage.Sdk.Configuration.StorageSettings.RootFolder"/>).</summary>
public interface IStorageService
{
    Task<string> UploadAsync(UploadFileRequest request, CancellationToken ct = default);

    Task DeleteAsync(string key, CancellationToken ct = default);

    string BuildPublicUrl(string key);
}

public sealed class UploadFileRequest
{
    /// <summary>A factory, not an already-open stream: UploadAsync opens (and disposes) its own
    /// stream right before the actual upload call, instead of the caller opening one upfront and
    /// handing it over. Keeps this SDK decoupled from whatever the caller's source is (IFormFile,
    /// disk, etc.) while still giving each consumer full ownership of its own stream's lifecycle.</summary>
    public required Func<Stream> OpenContent { get; init; }

    public required string OriginalFileName { get; init; } // used for the extension
    public required string ContentType { get; init; }
    public required string Folder { get; init; }            // e.g. "documents"

    /// <summary>Set for genuine photo uploads (vendor photos, website hero/gallery) so the file is
    /// downscaled and re-encoded as JPEG before it ever reaches storage — full-resolution camera
    /// photos otherwise ship straight to the public wedding-website, which is the single biggest
    /// hit to page-load speed. Left false for documents/contracts, where fidelity matters more than
    /// load time and the source may not even be an image.</summary>
    public bool OptimizeAsPhoto { get; init; }
}
