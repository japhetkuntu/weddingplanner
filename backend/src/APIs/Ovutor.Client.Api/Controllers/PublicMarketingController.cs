using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Client.Api.Interfaces;

namespace Ovutor.Client.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/public/marketing")]
public class PublicMarketingController(IPublicMarketingService publicMarketingService) : ControllerBase
{
    [HttpGet("pages/{pageSlug}")]
    public async Task<IActionResult> GetPage(string pageSlug, CancellationToken ct)
    {
        var response = await publicMarketingService.GetPageAsync(pageSlug, ct);
        return StatusCode(response.Code, response);
    }
}
