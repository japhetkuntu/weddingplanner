namespace Ovutor.Admin.Api.Models.Responses;

public record RsvpGuestResponse(
    Guid Id,
    Guid ClientId,
    string Household,
    string Status,
    int? AttendanceCount,
    string? Dietary,
    string? PlannerNote,
    string? RespondedAt,
    string? Email,
    string? Mobile,
    bool? NeedsAccommodation,
    bool? NeedsTransportation);
