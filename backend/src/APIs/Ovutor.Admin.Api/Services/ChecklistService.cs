using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class ChecklistService(
    IRepository<ChecklistPhase> phases,
    IRepository<ChecklistTask> tasks,
    ILogger<ChecklistService> logger) : IChecklistService
{
    public async Task<IApiResponse<ChecklistResponse>> GetForClientAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var phaseList = await phases.GetQueryable().Where(p => p.ClientId == clientId).OrderBy(p => p.Order).ToListAsync(ct);
            var taskList = await tasks.GetQueryable().Where(t => t.ClientId == clientId).ToListAsync(ct);
            var response = new ChecklistResponse(phaseList.Select(ToResponse).ToList(), taskList.Select(ToResponse).ToList());
            return response.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetForClientAsync] Failed to load checklist for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<ChecklistResponse>("Failed to load checklist.");
        }
    }

    public async Task<IApiResponse<ChecklistPhaseResponse>> AddPhaseAsync(Guid clientId, CreatePhaseRequest request, CancellationToken ct = default)
    {
        try
        {
            var title = request.Title.Trim();
            if (string.IsNullOrEmpty(title)) return ApiResponseFactory.BadRequest<ChecklistPhaseResponse>("Give this checklist a name.");

            var nextOrder = await phases.GetQueryable().Where(p => p.ClientId == clientId).CountAsync(ct) + 1;
            var phase = new ChecklistPhase { ClientId = clientId, Title = title, Order = nextOrder };
            await phases.AddAsync(phase, ct);
            return ToResponse(phase).ToCreatedApiResponse("Checklist added.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[AddPhaseAsync] Failed to add phase for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<ChecklistPhaseResponse>("Failed to add checklist.");
        }
    }

    public async Task<IApiResponse<ChecklistPhaseResponse>> UpdatePhaseAsync(Guid phaseId, UpdatePhaseRequest request, CancellationToken ct = default)
    {
        try
        {
            var phase = await phases.GetByIdAsync(phaseId, ct) ?? throw new NotFoundException("We couldn't find that checklist.");
            phase.Title = string.IsNullOrWhiteSpace(request.Title) ? phase.Title : request.Title.Trim();
            phase.Description = request.Description;
            await phases.UpdateAsync(phase, ct);
            return ToResponse(phase).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdatePhaseAsync] Failed to update phase {PhaseId}", phaseId);
            return ApiResponseFactory.InternalError<ChecklistPhaseResponse>("Failed to save checklist.");
        }
    }

    public async Task<IApiResponse<object>> DeletePhaseAsync(Guid phaseId, CancellationToken ct = default)
    {
        try
        {
            var phase = await phases.GetByIdAsync(phaseId, ct) ?? throw new NotFoundException("We couldn't find that checklist.");
            var phaseTasks = await tasks.FindManyAsync(t => t.PhaseId == phaseId, ct);
            foreach (var task in phaseTasks) await tasks.RemoveAsync(task, ct);
            await phases.RemoveAsync(phase, ct);
            return new object().ToOkApiResponse("Checklist deleted.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[DeletePhaseAsync] Failed to delete phase {PhaseId}", phaseId);
            return ApiResponseFactory.InternalError<object>("Failed to delete checklist.");
        }
    }

    public async Task<IApiResponse<ChecklistTaskResponse>> AddTaskAsync(Guid phaseId, CancellationToken ct = default)
    {
        try
        {
            var phase = await phases.GetByIdAsync(phaseId, ct) ?? throw new NotFoundException("We couldn't find that checklist.");
            var task = new ChecklistTask { ClientId = phase.ClientId, PhaseId = phaseId, Title = "New task", Status = "open" };
            await tasks.AddAsync(task, ct);
            return ToResponse(task).ToCreatedApiResponse("Task added.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[AddTaskAsync] Failed to add task to phase {PhaseId}", phaseId);
            return ApiResponseFactory.InternalError<ChecklistTaskResponse>("Failed to add task.");
        }
    }

    public async Task<IApiResponse<ChecklistTaskResponse>> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, CancellationToken ct = default)
    {
        try
        {
            var task = await tasks.GetByIdAsync(taskId, ct) ?? throw new NotFoundException("We couldn't find that task.");
            task.Title = string.IsNullOrWhiteSpace(request.Title) ? task.Title : request.Title.Trim();
            task.Note = request.Note;
            task.DueDate = string.IsNullOrWhiteSpace(request.DueDate) ? null : DateOnly.Parse(request.DueDate);
            await tasks.UpdateAsync(task, ct);
            return ToResponse(task).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateTaskAsync] Failed to update task {TaskId}", taskId);
            return ApiResponseFactory.InternalError<ChecklistTaskResponse>("Failed to save task.");
        }
    }

    public async Task<IApiResponse<ChecklistTaskResponse>> ToggleTaskAsync(Guid taskId, CancellationToken ct = default)
    {
        try
        {
            var task = await tasks.GetByIdAsync(taskId, ct) ?? throw new NotFoundException("We couldn't find that task.");
            if (task.Status == "blocked") return ToResponse(task).ToOkApiResponse();
            task.Status = task.Status == "done" ? "open" : "done";
            await tasks.UpdateAsync(task, ct);
            return ToResponse(task).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[ToggleTaskAsync] Failed to toggle task {TaskId}", taskId);
            return ApiResponseFactory.InternalError<ChecklistTaskResponse>("Failed to update task.");
        }
    }

    public async Task<IApiResponse<object>> DeleteTaskAsync(Guid taskId, CancellationToken ct = default)
    {
        try
        {
            var task = await tasks.GetByIdAsync(taskId, ct) ?? throw new NotFoundException("We couldn't find that task.");
            await tasks.RemoveAsync(task, ct);
            return new object().ToOkApiResponse("Task deleted.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[DeleteTaskAsync] Failed to delete task {TaskId}", taskId);
            return ApiResponseFactory.InternalError<object>("Failed to delete task.");
        }
    }

    private static ChecklistPhaseResponse ToResponse(ChecklistPhase p) => new(p.Id, p.ClientId, p.Title, p.Description, p.Order);

    private static ChecklistTaskResponse ToResponse(ChecklistTask t) => new(
        t.Id, t.ClientId, t.PhaseId, t.Title, t.Status, t.DueDate?.ToString("yyyy-MM-dd"), t.Priority, t.Note);
}
