using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
public class RsvpsController(IRsvpService rsvpService) : ControllerBase
{
    [HttpGet("api/clients/{clientId:guid}/rsvps")]
    public async Task<IActionResult> GetForClient(Guid clientId, CancellationToken ct)
    {
        var response = await rsvpService.GetForClientAsync(clientId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/rsvps/{rsvpId:guid}")]
    public async Task<IActionResult> Update(Guid rsvpId, UpdateRsvpRequest request, CancellationToken ct)
    {
        var response = await rsvpService.UpdateAsync(rsvpId, request, ct);
        return StatusCode(response.Code, response);
    }
}
