namespace Ovutor.Admin.Api.Models.Responses;

public record ChecklistPhaseResponse(Guid Id, Guid ClientId, string Title, string? Description, int Order);

public record ChecklistTaskResponse(
    Guid Id,
    Guid ClientId,
    Guid PhaseId,
    string Title,
    string Status,
    string? DueDate,
    string? Priority,
    string? Note);

public record ChecklistResponse(List<ChecklistPhaseResponse> Phases, List<ChecklistTaskResponse> Tasks);
