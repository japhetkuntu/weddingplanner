namespace Ovutor.Client.Api.Models.Requests;

public record SubmitEnquiryRequest(
    string Name,
    string Email,
    string? WeddingDate,
    string? Location,
    int? GuestCount,
    string? Budget,
    string? Message);
