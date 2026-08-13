using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IProfileService
{
    Task<IApiResponse<AdminUserResponse>> GetMeAsync(Guid adminId, CancellationToken ct = default);
    Task<IApiResponse<AdminUserResponse>> UpdateProfileAsync(Guid adminId, UpdateProfileRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> ChangePasswordAsync(Guid adminId, ChangePasswordRequest request, CancellationToken ct = default);
}
