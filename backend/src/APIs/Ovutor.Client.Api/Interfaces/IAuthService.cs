using Ovutor.Client.Api.Models.Requests;
using Ovutor.Client.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Client.Api.Interfaces;

public interface IAuthService
{
    Task<IApiResponse<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<IApiResponse<LoginResponse>> RefreshAsync(RefreshRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> LogoutAsync(string refreshToken, CancellationToken ct = default);
}
