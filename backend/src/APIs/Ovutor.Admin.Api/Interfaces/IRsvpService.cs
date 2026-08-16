using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IRsvpService
{
    Task<IApiResponse<List<RsvpGuestResponse>>> GetForClientAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<RsvpGuestResponse>> UpdateAsync(Guid rsvpId, UpdateRsvpRequest request, CancellationToken ct = default);
    Task<IApiResponse<List<RsvpGuestResponse>>> AddGuestsAsync(Guid clientId, AddGuestsRequest request, CancellationToken ct = default);
}
