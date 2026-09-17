using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

/// <summary>Editing the Ovutor studio's own marketing site (apps/wedding-website) — not scoped to a
/// client, unlike WebsiteController which edits a couple's site.</summary>
[ApiController]
[Authorize]
public class MarketingController(IMarketingService marketingService) : ControllerBase
{
    [HttpGet("api/marketing/pages/{pageSlug}/hero")]
    public async Task<IActionResult> GetHero(string pageSlug, CancellationToken ct)
    {
        var response = await marketingService.GetHeroAsync(pageSlug, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/marketing/pages/{pageSlug}/hero")]
    public async Task<IActionResult> UpdateHero(string pageSlug, UpdateMarketingHeroRequest request, CancellationToken ct)
    {
        var response = await marketingService.UpdateHeroAsync(pageSlug, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("api/marketing/pages/{pageSlug}/sections")]
    public async Task<IActionResult> GetSections(string pageSlug, CancellationToken ct)
    {
        var response = await marketingService.GetSectionsAsync(pageSlug, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/marketing/pages/{pageSlug}/sections")]
    public async Task<IActionResult> CreateSection(string pageSlug, CreateMarketingSectionRequest request, CancellationToken ct)
    {
        var response = await marketingService.CreateSectionAsync(pageSlug, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/marketing/pages/{pageSlug}/sections/order")]
    public async Task<IActionResult> ReorderSections(string pageSlug, ReorderMarketingSectionsRequest request, CancellationToken ct)
    {
        var response = await marketingService.ReorderSectionsAsync(pageSlug, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/marketing/sections/{sectionId:guid}")]
    public async Task<IActionResult> UpdateSection(Guid sectionId, UpdateMarketingSectionRequest request, CancellationToken ct)
    {
        var response = await marketingService.UpdateSectionAsync(sectionId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPatch("api/marketing/sections/{sectionId:guid}/enabled")]
    public async Task<IActionResult> SetSectionEnabled(Guid sectionId, SetMarketingSectionEnabledRequest request, CancellationToken ct)
    {
        var response = await marketingService.SetSectionEnabledAsync(sectionId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("api/marketing/sections/{sectionId:guid}")]
    public async Task<IActionResult> DeleteSection(Guid sectionId, CancellationToken ct)
    {
        var response = await marketingService.DeleteSectionAsync(sectionId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/marketing/pages/{pageSlug}/images")]
    public async Task<IActionResult> UploadImage(string pageSlug, [FromForm] UploadMarketingImageForm form, CancellationToken ct)
    {
        var response = await marketingService.UploadImageAsync(pageSlug, form.File, ct);
        return StatusCode(response.Code, response);
    }
}
