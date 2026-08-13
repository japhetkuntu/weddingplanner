using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Client.Api.Interfaces;
using Ovutor.Client.Api.Models.Requests;

namespace Ovutor.Client.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var response = await authService.LoginAsync(request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshRequest request, CancellationToken ct)
    {
        var response = await authService.RefreshAsync(request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request, CancellationToken ct)
    {
        var response = await authService.LogoutAsync(request.RefreshToken, ct);
        return StatusCode(response.Code, response);
    }
}
