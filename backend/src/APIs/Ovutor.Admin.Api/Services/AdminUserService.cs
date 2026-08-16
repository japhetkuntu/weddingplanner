using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Common.Sdk.Security;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class AdminUserService(IRepository<AdminUser> adminUsers, ILogger<AdminUserService> logger) : IAdminUserService
{
    public async Task<IApiResponse<List<AdminUserResponse>>> GetTeamAsync(CancellationToken ct = default)
    {
        try
        {
            var users = await adminUsers.GetQueryable().OrderBy(u => u.Name).ToListAsync(ct);
            return users.Select(ToResponse).ToList().ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetTeamAsync] Failed to load team members");
            return ApiResponseFactory.InternalError<List<AdminUserResponse>>("Failed to load team members.");
        }
    }

    public async Task<IApiResponse<CreateAdminUserResponse>> AddTeamMemberAsync(AddAdminUserRequest request, CancellationToken ct = default)
    {
        try
        {
            var name = request.Name.Trim();
            var email = request.Email.Trim().ToLowerInvariant();
            var role = string.IsNullOrWhiteSpace(request.Role) ? "Planner" : request.Role.Trim();

            if (string.IsNullOrEmpty(name)) return ApiResponseFactory.BadRequest<CreateAdminUserResponse>("Give this team member a name.");
            if (string.IsNullOrEmpty(email)) return ApiResponseFactory.BadRequest<CreateAdminUserResponse>("Give this team member an email.");
            if (await adminUsers.ExistsAsync(u => u.Email == email, ct))
                return ApiResponseFactory.Conflict<CreateAdminUserResponse>("Someone on the team already uses that email.");

            var temporaryPassword = CredentialGenerator.GeneratePassword();
            var user = new AdminUser { Name = name, Email = email, PasswordHash = PasswordHasher.Hash(temporaryPassword), Role = role };
            await adminUsers.AddAsync(user, ct);

            return new CreateAdminUserResponse(ToResponse(user), temporaryPassword).ToCreatedApiResponse("Team member added.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[AddTeamMemberAsync] Failed to add team member {Email}", request.Email);
            return ApiResponseFactory.InternalError<CreateAdminUserResponse>("Failed to add team member.");
        }
    }

    public async Task<IApiResponse<object>> RemoveTeamMemberAsync(Guid id, Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            if (id == requestingAdminId) return ApiResponseFactory.BadRequest<object>("You can't remove your own account.");

            var user = await adminUsers.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that team member.");

            var totalCount = await adminUsers.GetQueryable().CountAsync(ct);
            if (totalCount <= 1) return ApiResponseFactory.BadRequest<object>("The admin portal needs at least one team member.");

            await adminUsers.RemoveAsync(user, ct);
            return new object().ToOkApiResponse("Team member removed.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[RemoveTeamMemberAsync] Failed to remove team member {Id}", id);
            return ApiResponseFactory.InternalError<object>("Failed to remove team member.");
        }
    }

    private static AdminUserResponse ToResponse(AdminUser u) => new(u.Id, u.Name, u.Email, u.Role);
}
