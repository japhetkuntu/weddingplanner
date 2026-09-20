using Ovutor.Client.Api.Models.Requests;
using Ovutor.Client.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Client.Api.Interfaces;

public interface IPublicMarketingService
{
    Task<IApiResponse<PublicMarketingPageResponse>> GetPageAsync(string pageSlug, CancellationToken ct = default);
    Task<IApiResponse<object>> SubmitEnquiryAsync(SubmitEnquiryRequest request, CancellationToken ct = default);
}
