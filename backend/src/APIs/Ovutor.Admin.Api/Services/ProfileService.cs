using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Common.Sdk.Security;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class ProfileService(IRepository<AdminUser> adminUsers, ILogger<ProfileService> logger) : IProfileService
{
    public async Task<IApiResponse<AdminUserResponse>> GetMeAsync(Guid adminId, CancellationToken ct = default)
    {
        var user = await adminUsers.GetByIdAsync(adminId, ct) ?? throw new NotFoundException("Admin account not found.");
        return ToResponse(user).ToOkApiResponse();
    }

    public async Task<IApiResponse<AdminUserResponse>> UpdateProfileAsync(Guid adminId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        try
        {
            var user = await adminUsers.GetByIdAsync(adminId, ct) ?? throw new NotFoundException("Admin account not found.");
            user.Name = request.Name.Trim();
            user.Email = request.Email.Trim().ToLowerInvariant();
            await adminUsers.UpdateAsync(user, ct);
            return ToResponse(user).ToOkApiResponse("Profile saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateProfileAsync] Failed to update profile for {AdminId}", adminId);
            return ApiResponseFactory.InternalError<AdminUserResponse>("Failed to save profile.");
        }
    }

    public async Task<IApiResponse<object>> ChangePasswordAsync(Guid adminId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        try
        {
            var user = await adminUsers.GetByIdAsync(adminId, ct) ?? throw new NotFoundException("Admin account not found.");
            if (!PasswordHasher.Verify(request.CurrentPassword, user.PasswordHash))
                return ApiResponseFactory.BadRequest<object>("Your current password isn't correct.");

            if (request.NewPassword.Length < 10 || !request.NewPassword.Any(char.IsDigit))
                return ApiResponseFactory.BadRequest<object>("Use at least 10 characters, including a number.");

            user.PasswordHash = PasswordHasher.Hash(request.NewPassword);
            await adminUsers.UpdateAsync(user, ct);
            return new object().ToOkApiResponse("Password updated.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[ChangePasswordAsync] Failed to change password for {AdminId}", adminId);
            return ApiResponseFactory.InternalError<object>("Failed to update password.");
        }
    }

    private static AdminUserResponse ToResponse(AdminUser user) => new(user.Id, user.Name, user.Email, user.Role);
}
