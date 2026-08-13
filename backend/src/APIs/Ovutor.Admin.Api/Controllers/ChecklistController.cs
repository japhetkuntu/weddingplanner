using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
public class ChecklistController(IChecklistService checklistService) : ControllerBase
{
    [HttpGet("api/clients/{clientId:guid}/checklist")]
    public async Task<IActionResult> GetForClient(Guid clientId, CancellationToken ct)
    {
        var response = await checklistService.GetForClientAsync(clientId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/clients/{clientId:guid}/checklist/phases")]
    public async Task<IActionResult> AddPhase(Guid clientId, CreatePhaseRequest request, CancellationToken ct)
    {
        var response = await checklistService.AddPhaseAsync(clientId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/checklist/phases/{phaseId:guid}")]
    public async Task<IActionResult> UpdatePhase(Guid phaseId, UpdatePhaseRequest request, CancellationToken ct)
    {
        var response = await checklistService.UpdatePhaseAsync(phaseId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("api/checklist/phases/{phaseId:guid}")]
    public async Task<IActionResult> DeletePhase(Guid phaseId, CancellationToken ct)
    {
        var response = await checklistService.DeletePhaseAsync(phaseId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/checklist/phases/{phaseId:guid}/tasks")]
    public async Task<IActionResult> AddTask(Guid phaseId, CancellationToken ct)
    {
        var response = await checklistService.AddTaskAsync(phaseId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/checklist/tasks/{taskId:guid}")]
    public async Task<IActionResult> UpdateTask(Guid taskId, UpdateTaskRequest request, CancellationToken ct)
    {
        var response = await checklistService.UpdateTaskAsync(taskId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPatch("api/checklist/tasks/{taskId:guid}/toggle")]
    public async Task<IActionResult> ToggleTask(Guid taskId, CancellationToken ct)
    {
        var response = await checklistService.ToggleTaskAsync(taskId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("api/checklist/tasks/{taskId:guid}")]
    public async Task<IActionResult> DeleteTask(Guid taskId, CancellationToken ct)
    {
        var response = await checklistService.DeleteTaskAsync(taskId, ct);
        return StatusCode(response.Code, response);
    }
}
