using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/clients")]
public class ClientsController(IClientService clientService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var response = await clientService.GetAllAsync(ct);
        return StatusCode(response.Code, response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var response = await clientService.GetByIdAsync(id, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClientRequest request, CancellationToken ct)
    {
        var response = await clientService.CreateAsync(request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateClientRequest request, CancellationToken ct)
    {
        var response = await clientService.UpdateAsync(id, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{id:guid}/portal-email")]
    public async Task<IActionResult> UpdatePortalEmail(Guid id, UpdatePortalEmailRequest request, CancellationToken ct)
    {
        var response = await clientService.UpdatePortalEmailAsync(id, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("{id:guid}/full-payment-due-date")]
    public async Task<IActionResult> UpdateFullPaymentDueDate(Guid id, UpdateFullPaymentDueDateRequest request, CancellationToken ct)
    {
        var response = await clientService.UpdateFullPaymentDueDateAsync(id, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("{id:guid}/portal-password/reset")]
    public async Task<IActionResult> ResetPortalPassword(Guid id, CancellationToken ct)
    {
        var response = await clientService.ResetPortalPasswordAsync(id, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken ct)
    {
        var response = await clientService.ArchiveAsync(id, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("{id:guid}/unarchive")]
    public async Task<IActionResult> Unarchive(Guid id, CancellationToken ct)
    {
        var response = await clientService.UnarchiveAsync(id, ct);
        return StatusCode(response.Code, response);
    }
}
