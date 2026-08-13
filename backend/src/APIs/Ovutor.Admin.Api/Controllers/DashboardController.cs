using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Interfaces;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var response = await dashboardService.GetAsync(ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("/api/clients/{clientId:guid}/activity")]
    public async Task<IActionResult> GetForClient(Guid clientId, CancellationToken ct)
    {
        var response = await dashboardService.GetForClientAsync(clientId, ct);
        return StatusCode(response.Code, response);
    }
}
