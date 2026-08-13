using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Client.Api.Interfaces;
using Ovutor.Client.Api.Models.Requests;

namespace Ovutor.Client.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/public/sites")]
public class PublicSiteController(IPublicSiteService publicSiteService) : ControllerBase
{
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetSite(string slug, CancellationToken ct)
    {
        var response = await publicSiteService.GetSiteAsync(slug, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("{slug}/rsvp")]
    public async Task<IActionResult> SubmitRsvp(string slug, SubmitRsvpRequest request, CancellationToken ct)
    {
        var response = await publicSiteService.SubmitRsvpAsync(slug, request, ct);
        return StatusCode(response.Code, response);
    }
}
