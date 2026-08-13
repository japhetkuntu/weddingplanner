namespace Ovutor.Client.Api.Models.Requests;

public record SubmitRsvpRequest(string FullName, bool Attending, int? AttendanceCount, string? Dietary);
