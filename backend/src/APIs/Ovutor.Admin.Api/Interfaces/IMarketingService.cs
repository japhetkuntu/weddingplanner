using Microsoft.AspNetCore.Http;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IMarketingService
{
    Task<IApiResponse<MarketingHeroResponse>> GetHeroAsync(string pageSlug, CancellationToken ct = default);
    Task<IApiResponse<MarketingHeroResponse>> UpdateHeroAsync(string pageSlug, UpdateMarketingHeroRequest request, CancellationToken ct = default);

    Task<IApiResponse<List<MarketingSectionResponse>>> GetSectionsAsync(string pageSlug, CancellationToken ct = default);
    Task<IApiResponse<MarketingSectionResponse>> CreateSectionAsync(string pageSlug, CreateMarketingSectionRequest request, CancellationToken ct = default);
    Task<IApiResponse<MarketingSectionResponse>> UpdateSectionAsync(Guid sectionId, UpdateMarketingSectionRequest request, CancellationToken ct = default);
    Task<IApiResponse<MarketingSectionResponse>> SetSectionEnabledAsync(Guid sectionId, SetMarketingSectionEnabledRequest request, CancellationToken ct = default);
    Task<IApiResponse<List<MarketingSectionResponse>>> ReorderSectionsAsync(string pageSlug, ReorderMarketingSectionsRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteSectionAsync(Guid sectionId, CancellationToken ct = default);

    Task<IApiResponse<MarketingImageUploadResponse>> UploadImageAsync(string pageSlug, IFormFile file, CancellationToken ct = default);
}
