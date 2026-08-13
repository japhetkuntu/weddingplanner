using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IAuthService
{
    Task<IApiResponse<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<IApiResponse<LoginResponse>> RefreshAsync(RefreshRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> LogoutAsync(string refreshToken, CancellationToken ct = default);
    Task<IApiResponse<ForgotPasswordResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default);
}
