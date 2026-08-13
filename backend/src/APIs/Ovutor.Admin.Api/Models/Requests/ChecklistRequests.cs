namespace Ovutor.Admin.Api.Models.Requests;

public record CreatePhaseRequest(string Title);

public record UpdatePhaseRequest(string Title, string? Description);

public record UpdateTaskRequest(string Title, string? Note, string? DueDate);
