using Ovutor.Client.Api.Models.Requests;
using Ovutor.Client.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Client.Api.Interfaces;

public interface IPublicSiteService
{
    Task<IApiResponse<PublicSiteResponse>> GetSiteAsync(string slug, CancellationToken ct = default);
    Task<IApiResponse<object>> SubmitRsvpAsync(string slug, SubmitRsvpRequest request, CancellationToken ct = default);
}
