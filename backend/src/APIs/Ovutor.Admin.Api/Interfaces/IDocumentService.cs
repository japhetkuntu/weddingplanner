using Microsoft.AspNetCore.Http;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IDocumentService
{
    Task<IApiResponse<List<DocumentFileResponse>>> GetForClientAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<DocumentFileResponse>> UploadAsync(Guid clientId, IFormFile file, string category, string visibility, string uploaderName, CancellationToken ct = default);
    Task<IApiResponse<DocumentFileResponse>> UpdateAsync(Guid documentId, UpdateDocumentRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteAsync(Guid documentId, CancellationToken ct = default);
    Task<IApiResponse<List<string>>> GetCategoriesAsync(CancellationToken ct = default);
    Task<IApiResponse<List<string>>> AddCategoryAsync(CreateDocumentCategoryRequest request, CancellationToken ct = default);
}
