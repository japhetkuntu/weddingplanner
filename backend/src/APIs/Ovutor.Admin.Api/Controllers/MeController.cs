using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Common;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/me")]
public class MeController(IProfileService profileService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var response = await profileService.GetMeAsync(ClaimsReader.GetAdminId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request, CancellationToken ct)
    {
        var response = await profileService.UpdateProfileAsync(ClaimsReader.GetAdminId(User), request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        var response = await profileService.ChangePasswordAsync(ClaimsReader.GetAdminId(User), request, ct);
        return StatusCode(response.Code, response);
    }
}
