using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IAdminUserService
{
    Task<IApiResponse<List<AdminUserResponse>>> GetTeamAsync(CancellationToken ct = default);
    Task<IApiResponse<CreateAdminUserResponse>> AddTeamMemberAsync(AddAdminUserRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> RemoveTeamMemberAsync(Guid id, Guid requestingAdminId, CancellationToken ct = default);
}
