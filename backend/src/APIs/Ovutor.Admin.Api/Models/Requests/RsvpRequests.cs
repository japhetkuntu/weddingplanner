namespace Ovutor.Admin.Api.Models.Requests;

public record UpdateRsvpRequest(
    string Status,
    int? AttendanceCount,
    string? Dietary,
    string? PlannerNote,
    string? Email,
    string? Mobile,
    bool? NeedsAccommodation,
    bool? NeedsTransportation);

public record GuestEntryRequest(string Household, string? Email, string? Mobile);

public record AddGuestsRequest(List<GuestEntryRequest> Guests);
