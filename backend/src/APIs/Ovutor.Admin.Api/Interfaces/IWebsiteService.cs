using Microsoft.AspNetCore.Http;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IWebsiteService
{
    Task<IApiResponse<List<WebsiteSectionResponse>>> GetSectionsAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<WebsiteSectionResponse>> UpdateSectionStatusAsync(Guid sectionId, UpdateSectionStatusRequest request, CancellationToken ct = default);
    Task<IApiResponse<WebsiteContentResponse>> GetContentAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<WebsiteContentResponse>> UpdateContentAsync(Guid clientId, UpdateWebsiteContentRequest request, CancellationToken ct = default);
    Task<IApiResponse<WebsiteImageUploadResponse>> UploadImageAsync(Guid clientId, IFormFile file, CancellationToken ct = default);
}
