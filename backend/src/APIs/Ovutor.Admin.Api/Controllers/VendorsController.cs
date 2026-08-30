using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Common;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/vendors")]
public class VendorsController(IVendorService vendorService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var response = await vendorService.GetAllAsync(ClaimsReader.GetAdminId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    public async Task<IActionResult> Add(CreateVendorRequest request, CancellationToken ct)
    {
        var response = await vendorService.AddAsync(request, ClaimsReader.GetAdminId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{vendorId:guid}")]
    public async Task<IActionResult> Update(Guid vendorId, UpdateVendorRequest request, CancellationToken ct)
    {
        var response = await vendorService.UpdateAsync(vendorId, request, ClaimsReader.GetAdminId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("{vendorId:guid}")]
    public async Task<IActionResult> Delete(Guid vendorId, CancellationToken ct)
    {
        var response = await vendorService.DeleteAsync(vendorId, ClaimsReader.GetAdminId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("{vendorId:guid}/photo")]
    public async Task<IActionResult> UploadPhoto(Guid vendorId, [FromForm] UploadVendorFileForm form, CancellationToken ct)
    {
        var response = await vendorService.UploadPhotoAsync(vendorId, form.File, ClaimsReader.GetAdminId(User), ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("{vendorId:guid}/contract")]
    public async Task<IActionResult> UploadContract(Guid vendorId, [FromForm] UploadVendorFileForm form, CancellationToken ct)
    {
        var response = await vendorService.UploadContractAsync(vendorId, form.File, ClaimsReader.GetAdminId(User), ct);
        return StatusCode(response.Code, response);
    }
}
