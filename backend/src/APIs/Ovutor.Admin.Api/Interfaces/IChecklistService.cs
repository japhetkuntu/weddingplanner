using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IChecklistService
{
    Task<IApiResponse<ChecklistResponse>> GetForClientAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<ChecklistPhaseResponse>> AddPhaseAsync(Guid clientId, CreatePhaseRequest request, CancellationToken ct = default);
    Task<IApiResponse<ChecklistPhaseResponse>> UpdatePhaseAsync(Guid phaseId, UpdatePhaseRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> DeletePhaseAsync(Guid phaseId, CancellationToken ct = default);
    Task<IApiResponse<ChecklistTaskResponse>> AddTaskAsync(Guid phaseId, CancellationToken ct = default);
    Task<IApiResponse<ChecklistTaskResponse>> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, CancellationToken ct = default);
    Task<IApiResponse<ChecklistTaskResponse>> ToggleTaskAsync(Guid taskId, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteTaskAsync(Guid taskId, CancellationToken ct = default);
}
