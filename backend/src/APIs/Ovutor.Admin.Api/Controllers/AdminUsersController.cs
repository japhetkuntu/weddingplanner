using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Common;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin-users")]
public class AdminUsersController(IAdminUserService adminUserService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetTeam(CancellationToken ct)
    {
        var response = await adminUserService.GetTeamAsync(ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    public async Task<IActionResult> AddTeamMember(AddAdminUserRequest request, CancellationToken ct)
    {
        var response = await adminUserService.AddTeamMemberAsync(request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveTeamMember(Guid id, CancellationToken ct)
    {
        var response = await adminUserService.RemoveTeamMemberAsync(id, ClaimsReader.GetAdminId(User), ct);
        return StatusCode(response.Code, response);
    }
}
