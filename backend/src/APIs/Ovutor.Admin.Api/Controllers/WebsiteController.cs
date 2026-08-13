using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
public class WebsiteController(IWebsiteService websiteService) : ControllerBase
{
    [HttpGet("api/clients/{clientId:guid}/website/sections")]
    public async Task<IActionResult> GetSections(Guid clientId, CancellationToken ct)
    {
        var response = await websiteService.GetSectionsAsync(clientId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPatch("api/website/sections/{sectionId:guid}/status")]
    public async Task<IActionResult> UpdateSectionStatus(Guid sectionId, UpdateSectionStatusRequest request, CancellationToken ct)
    {
        var response = await websiteService.UpdateSectionStatusAsync(sectionId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("api/clients/{clientId:guid}/website/content")]
    public async Task<IActionResult> GetContent(Guid clientId, CancellationToken ct)
    {
        var response = await websiteService.GetContentAsync(clientId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/clients/{clientId:guid}/website/content")]
    public async Task<IActionResult> UpdateContent(Guid clientId, UpdateWebsiteContentRequest request, CancellationToken ct)
    {
        var response = await websiteService.UpdateContentAsync(clientId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/clients/{clientId:guid}/website/images")]
    public async Task<IActionResult> UploadImage(Guid clientId, [FromForm] UploadWebsiteImageForm form, CancellationToken ct)
    {
        var response = await websiteService.UploadImageAsync(clientId, form.File, ct);
        return StatusCode(response.Code, response);
    }
}
