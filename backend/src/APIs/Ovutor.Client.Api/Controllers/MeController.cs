using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Client.Api.Common;
using Ovutor.Client.Api.Interfaces;

namespace Ovutor.Client.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/me")]
public class MeController(IMeService meService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var response = await meService.GetProfileAsync(ClaimsReader.GetClientId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var response = await meService.GetDashboardAsync(ClaimsReader.GetClientId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("checklist")]
    public async Task<IActionResult> GetChecklist(CancellationToken ct)
    {
        var response = await meService.GetChecklistAsync(ClaimsReader.GetClientId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("budget")]
    public async Task<IActionResult> GetBudget(CancellationToken ct)
    {
        var response = await meService.GetBudgetAsync(ClaimsReader.GetClientId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("rsvps")]
    public async Task<IActionResult> GetRsvps(CancellationToken ct)
    {
        var response = await meService.GetRsvpsAsync(ClaimsReader.GetClientId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("documents")]
    public async Task<IActionResult> GetDocuments(CancellationToken ct)
    {
        var response = await meService.GetDocumentsAsync(ClaimsReader.GetClientId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("website")]
    public async Task<IActionResult> GetWebsite(CancellationToken ct)
    {
        var response = await meService.GetWebsiteStatusAsync(ClaimsReader.GetClientId(User), ct);
        return StatusCode(response.Code, response);
    }
}
