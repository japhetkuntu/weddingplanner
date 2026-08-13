namespace Ovutor.Admin.Api.Models.Requests;

public record UpdateRsvpRequest(string Status, int? AttendanceCount, string? Dietary, string? PlannerNote);
