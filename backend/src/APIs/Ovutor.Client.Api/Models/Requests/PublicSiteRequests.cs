namespace Ovutor.Client.Api.Models.Requests;

public record SubmitRsvpRequest(
    string FullName,
    bool Attending,
    string? Dietary,
    bool? NeedsAccommodation,
    bool? NeedsTransportation);
