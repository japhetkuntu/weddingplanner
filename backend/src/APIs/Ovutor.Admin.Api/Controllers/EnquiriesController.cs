using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

/// <summary>Studio-wide leads submitted through the wedding-website's "Connect with Us" form —
/// not scoped to a client, unlike RsvpsController.</summary>
[ApiController]
[Authorize]
[Route("api/marketing/enquiries")]
public class EnquiriesController(IEnquiryService enquiryService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var response = await enquiryService.GetAllAsync(ct);
        return StatusCode(response.Code, response);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> SetRead(Guid id, SetEnquiryReadRequest request, CancellationToken ct)
    {
        var response = await enquiryService.SetReadAsync(id, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var response = await enquiryService.DeleteAsync(id, ct);
        return StatusCode(response.Code, response);
    }
}
