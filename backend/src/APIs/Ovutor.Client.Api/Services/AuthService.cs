using System.Security.Claims;
using Ovutor.Client.Api.Interfaces;
using Ovutor.Client.Api.Models.Requests;
using Ovutor.Client.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Common.Sdk.Security;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;
using ClientEntity = Ovutor.Postgres.Sdk.Entities.Client;

namespace Ovutor.Client.Api.Services;

public class AuthService(
    IRepository<ClientEntity> clients,
    IRepository<RefreshToken> refreshTokens,
    JwtTokenService jwtTokenService,
    ILogger<AuthService> logger) : IAuthService
{
    public async Task<IApiResponse<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.FindAsync(c => c.PortalEmail == request.Email.Trim().ToLowerInvariant(), ct);
            if (client is null || !PasswordHasher.Verify(request.Password, client.PortalPasswordHash))
                return ApiResponseFactory.Unauthorized<LoginResponse>("We couldn't sign you in with those details.");

            var tokens = await IssueTokensAsync(client, ct);
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
            var stored = await refreshTokens.FindAsync(t => t.TokenHash == tokenHash && t.OwnerType == TokenOwnerType.Client, ct);
            if (stored is null || !stored.IsActive)
                return ApiResponseFactory.Unauthorized<LoginResponse>("Your session has expired. Please sign in again.");

            var client = await clients.GetByIdAsync(stored.OwnerId, ct);
            if (client is null) return ApiResponseFactory.Unauthorized<LoginResponse>("Your session has expired. Please sign in again.");

            stored.RevokedAtUtc = DateTime.UtcNow;
            await refreshTokens.UpdateAsync(stored, ct);

            var tokens = await IssueTokensAsync(client, ct);
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

    private async Task<LoginResponse> IssueTokensAsync(ClientEntity client, CancellationToken ct)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, client.Id.ToString()),
            new(ClaimTypes.Email, client.PortalEmail),
        };
        var accessToken = jwtTokenService.CreateAccessToken(claims);
        var refreshToken = JwtTokenService.GenerateRefreshToken();

        await refreshTokens.AddAsync(new RefreshToken
        {
            OwnerType = TokenOwnerType.Client,
            OwnerId = client.Id,
            TokenHash = JwtTokenService.HashToken(refreshToken),
            ExpiresAtUtc = jwtTokenService.RefreshExpiry(),
        }, ct);

        var userResponse = new ClientUserResponse(client.Id, client.CoupleNames, client.PartnerA, client.PartnerB, client.PortalEmail);
        return new LoginResponse(accessToken, refreshToken, userResponse);
    }
}
