using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Cache.Sdk.Services;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;
using Ovutor.Storage.Sdk;

namespace Ovutor.Admin.Api.Services;

public class DocumentService(
    IRepository<DocumentFile> documents,
    IRepository<DocumentCategory> categories,
    IStorageService storageService,
    ICacheService cache,
    ILogger<DocumentService> logger) : IDocumentService
{
    private const string CategoriesCacheKey = "document-categories";
    private static readonly TimeSpan CategoriesCacheTtl = TimeSpan.FromHours(6);

    public async Task<IApiResponse<List<DocumentFileResponse>>> GetForClientAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var list = await documents.GetQueryable().Where(d => d.ClientId == clientId).ToListAsync(ct);
            return list.Select(ToResponse).ToList().ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetForClientAsync] Failed to load documents for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<List<DocumentFileResponse>>("Failed to load documents.");
        }
    }

    public async Task<IApiResponse<DocumentFileResponse>> UploadAsync(Guid clientId, IFormFile file, string category, string visibility, string uploaderName, CancellationToken ct = default)
    {
        try
        {
            if (file.Length == 0) throw new OvutorException("The selected file is empty.", 400);

            var key = await storageService.UploadAsync(new UploadFileRequest
            {
                OpenContent = file.OpenReadStream,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                Folder = $"documents/{clientId}",
            }, ct);

            var document = new DocumentFile
            {
                ClientId = clientId,
                Name = file.FileName,
                Uploader = uploaderName,
                Visibility = visibility,
                Category = category,
                SizeLabel = FormatSize(file.Length),
                UploadedAtUtc = DateTime.UtcNow,
                StoragePath = key,
                ContentType = file.ContentType,
            };
            await documents.AddAsync(document, ct);
            return ToResponse(document).ToCreatedApiResponse("Document uploaded.");
        }
        catch (OvutorException) { throw; }
        catch (StorageException e)
        {
            logger.LogError(e, "[UploadAsync] Storage rejected upload for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<DocumentFileResponse>("Failed to upload document.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[UploadAsync] Failed to upload document for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<DocumentFileResponse>("Failed to upload document.");
        }
    }

    public async Task<IApiResponse<DocumentFileResponse>> UpdateAsync(Guid documentId, UpdateDocumentRequest request, CancellationToken ct = default)
    {
        try
        {
            var document = await documents.GetByIdAsync(documentId, ct) ?? throw new NotFoundException("We couldn't find that document.");
            document.Name = request.Name;
            document.Category = request.Category;
            document.Visibility = request.Visibility;
            await documents.UpdateAsync(document, ct);
            return ToResponse(document).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateAsync] Failed to update document {DocumentId}", documentId);
            return ApiResponseFactory.InternalError<DocumentFileResponse>("Failed to save document.");
        }
    }

    public async Task<IApiResponse<object>> DeleteAsync(Guid documentId, CancellationToken ct = default)
    {
        try
        {
            var document = await documents.GetByIdAsync(documentId, ct) ?? throw new NotFoundException("We couldn't find that document.");
            if (!string.IsNullOrWhiteSpace(document.StoragePath))
                await storageService.DeleteAsync(document.StoragePath, ct);
            await documents.RemoveAsync(document, ct);
            return ApiResponseFactory.Ok<object>(new { }, "Document deleted.");
        }
        catch (OvutorException) { throw; }
        catch (StorageException e)
        {
            logger.LogError(e, "[DeleteAsync] Storage rejected delete for document {DocumentId}", documentId);
            return ApiResponseFactory.InternalError<object>("Failed to delete document.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[DeleteAsync] Failed to delete document {DocumentId}", documentId);
            return ApiResponseFactory.InternalError<object>("Failed to delete document.");
        }
    }

    public async Task<IApiResponse<List<string>>> GetCategoriesAsync(CancellationToken ct = default)
    {
        try
        {
            var cached = await cache.GetAsync<List<string>>(CategoriesCacheKey);
            if (cached is not null) return cached.ToOkApiResponse();

            var list = await LoadCategoriesAsync(ct);
            await cache.SetAsync(CategoriesCacheKey, list, CategoriesCacheTtl);
            return list.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetCategoriesAsync] Failed to load document categories");
            return ApiResponseFactory.InternalError<List<string>>("Failed to load categories.");
        }
    }

    public async Task<IApiResponse<List<string>>> AddCategoryAsync(CreateDocumentCategoryRequest request, CancellationToken ct = default)
    {
        try
        {
            var exists = await categories.ExistsAsync(c => c.Name.ToLower() == request.Name.ToLower(), ct);
            if (!exists) await categories.AddAsync(new DocumentCategory { Name = request.Name }, ct);

            var list = await LoadCategoriesAsync(ct);
            await cache.SetAsync(CategoriesCacheKey, list, CategoriesCacheTtl);
            return list.ToOkApiResponse("Category added.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[AddCategoryAsync] Failed to add document category");
            return ApiResponseFactory.InternalError<List<string>>("Failed to add category.");
        }
    }

    private async Task<List<string>> LoadCategoriesAsync(CancellationToken ct) =>
        await categories.GetQueryable().OrderBy(c => c.Name).Select(c => c.Name).ToListAsync(ct);

    private static string FormatSize(long bytes)
    {
        if (bytes >= 1024 * 1024) return $"{bytes / (1024.0 * 1024.0):0.0} MB";
        if (bytes >= 1024) return $"{bytes / 1024.0:0.0} KB";
        return $"{bytes} B";
    }

    private DocumentFileResponse ToResponse(DocumentFile d) => new(
        d.Id, d.ClientId, d.Name, d.Uploader, d.Visibility, d.Category, d.SizeLabel,
        d.UploadedAtUtc.ToString("yyyy-MM-dd"),
        string.IsNullOrWhiteSpace(d.StoragePath) ? null : storageService.BuildPublicUrl(d.StoragePath),
        d.ContentType);
}
