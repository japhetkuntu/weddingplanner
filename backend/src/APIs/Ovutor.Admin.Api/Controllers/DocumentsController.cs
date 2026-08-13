using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Common;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
public class DocumentsController(IDocumentService documentService) : ControllerBase
{
    [HttpGet("api/clients/{clientId:guid}/documents")]
    public async Task<IActionResult> GetForClient(Guid clientId, CancellationToken ct)
    {
        var response = await documentService.GetForClientAsync(clientId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/clients/{clientId:guid}/documents")]
    public async Task<IActionResult> Upload(Guid clientId, [FromForm] UploadDocumentForm form, CancellationToken ct)
    {
        var uploaderName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Admin";
        _ = ClaimsReader.GetAdminId(User);
        var response = await documentService.UploadAsync(clientId, form.File, form.Category, form.Visibility, uploaderName, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/documents/{documentId:guid}")]
    public async Task<IActionResult> Update(Guid documentId, UpdateDocumentRequest request, CancellationToken ct)
    {
        var response = await documentService.UpdateAsync(documentId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("api/documents/{documentId:guid}")]
    public async Task<IActionResult> Delete(Guid documentId, CancellationToken ct)
    {
        var response = await documentService.DeleteAsync(documentId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("api/document-categories")]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var response = await documentService.GetCategoriesAsync(ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/document-categories")]
    public async Task<IActionResult> AddCategory(CreateDocumentCategoryRequest request, CancellationToken ct)
    {
        var response = await documentService.AddCategoryAsync(request, ct);
        return StatusCode(response.Code, response);
    }
}
