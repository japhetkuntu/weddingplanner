using System.Security.Claims;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Common.Sdk.Security;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class AuthService(
    IRepository<AdminUser> adminUsers,
    IRepository<RefreshToken> refreshTokens,
    JwtTokenService jwtTokenService,
    IConfiguration configuration,
    IHostEnvironment environment,
    ILogger<AuthService> logger) : IAuthService
{
    public async Task<IApiResponse<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        try
        {
            var user = await adminUsers.FindAsync(u => u.Email == request.Email.Trim().ToLowerInvariant(), ct);
            if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
                return ApiResponseFactory.Unauthorized<LoginResponse>("We couldn't sign you in with those details.");

            var tokens = await IssueTokensAsync(user, ct);
            return tokens.ToOkApiResponse("Signed in successfully.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[LoginAsync] Failed to sign in {Email}", request.Email);
            return ApiResponseFactory.InternalError<LoginResponse>("Failed to sign in.");
        }
    }

    public async Task<IApiResponse<LoginResponse>> RefreshAsync(RefreshRequest request, CancellationToken ct = default)
    {
        try
        {
            var tokenHash = JwtTokenService.HashToken(request.RefreshToken);
            var stored = await refreshTokens.FindAsync(t => t.TokenHash == tokenHash && t.OwnerType == TokenOwnerType.Admin, ct);
            if (stored is null || !stored.IsActive)
                return ApiResponseFactory.Unauthorized<LoginResponse>("Your session has expired. Please sign in again.");

            var user = await adminUsers.GetByIdAsync(stored.OwnerId, ct);
            if (user is null) return ApiResponseFactory.Unauthorized<LoginResponse>("Your session has expired. Please sign in again.");

            stored.RevokedAtUtc = DateTime.UtcNow;
            await refreshTokens.UpdateAsync(stored, ct);

            var tokens = await IssueTokensAsync(user, ct);
            return tokens.ToOkApiResponse("Session refreshed.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[RefreshAsync] Failed to refresh token");
            return ApiResponseFactory.InternalError<LoginResponse>("Failed to refresh session.");
        }
    }

    public async Task<IApiResponse<object>> LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        try
        {
            var tokenHash = JwtTokenService.HashToken(refreshToken);
            var stored = await refreshTokens.FindAsync(t => t.TokenHash == tokenHash, ct);
            if (stored is not null)
            {
                stored.RevokedAtUtc = DateTime.UtcNow;
                await refreshTokens.UpdateAsync(stored, ct);
            }

            return new object().ToOkApiResponse("Signed out.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[LogoutAsync] Failed to sign out");
            return ApiResponseFactory.InternalError<object>("Failed to sign out.");
        }
    }

    public async Task<IApiResponse<ForgotPasswordResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default)
    {
        try
        {
            var user = await adminUsers.FindAsync(u => u.Email == request.Email.Trim().ToLowerInvariant(), ct);
            const string genericMessage = "If that email matches an account, we've sent instructions to reset the password.";

            // Always return the generic message whether or not the account exists, so the endpoint can't
            // be used to enumerate registered admin emails.
            if (user is null) return new ForgotPasswordResponse(genericMessage, null).ToOkApiResponse();

            var resetToken = JwtTokenService.GenerateRefreshToken();
            user.PasswordResetTokenHash = JwtTokenService.HashToken(resetToken);
            user.PasswordResetExpiresAtUtc = DateTime.UtcNow.AddHours(1);
            await adminUsers.UpdateAsync(user, ct);

            var frontendUrl = configuration["Frontend:AdminPortalUrl"] ?? "http://localhost:5174";
            var resetLink = $"{frontendUrl}/reset-password/new?token={Uri.EscapeDataString(resetToken)}";

            // No email provider is wired up (see backend scope note) — logged instead of sent, and
            // returned directly in the response only outside Production so the reset flow is still
            // fully testable end-to-end locally. Echoing this in Production would let anyone hand
            // themselves a valid reset token for any admin email, defeating the generic message above.
            logger.LogInformation("[ForgotPasswordAsync] Password reset requested for {Email}. Link: {Link}", user.Email, resetLink);

            return new ForgotPasswordResponse(genericMessage, environment.IsProduction() ? null : resetLink).ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[ForgotPasswordAsync] Failed to process request for {Email}", request.Email);
            return ApiResponseFactory.InternalError<ForgotPasswordResponse>("Failed to process request.");
        }
    }

    public async Task<IApiResponse<object>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        try
        {
            var tokenHash = JwtTokenService.HashToken(request.Token);
            var user = await adminUsers.FindAsync(u => u.PasswordResetTokenHash == tokenHash, ct);
            if (user is null || user.PasswordResetExpiresAtUtc is null || user.PasswordResetExpiresAtUtc < DateTime.UtcNow)
                return ApiResponseFactory.BadRequest<object>("This reset link has expired. Please request a new one.");

            user.PasswordHash = PasswordHasher.Hash(request.NewPassword);
            user.PasswordResetTokenHash = null;
            user.PasswordResetExpiresAtUtc = null;
            await adminUsers.UpdateAsync(user, ct);

            return new object().ToOkApiResponse("Password updated. Sign in with your new password.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[ResetPasswordAsync] Failed to reset password");
            return ApiResponseFactory.InternalError<object>("Failed to reset password.");
        }
    }

    private async Task<LoginResponse> IssueTokensAsync(AdminUser user, CancellationToken ct)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, "Admin"),
        };
        var accessToken = jwtTokenService.CreateAccessToken(claims);
        var refreshToken = JwtTokenService.GenerateRefreshToken();

        await refreshTokens.AddAsync(new RefreshToken
        {
            OwnerType = TokenOwnerType.Admin,
            OwnerId = user.Id,
            TokenHash = JwtTokenService.HashToken(refreshToken),
            ExpiresAtUtc = jwtTokenService.RefreshExpiry(),
        }, ct);

        var userResponse = new AdminUserResponse(user.Id, user.Name, user.Email, user.Role);
        return new LoginResponse(accessToken, refreshToken, userResponse);
    }
}
