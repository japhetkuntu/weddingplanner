namespace Ovutor.Client.Api.Models.Requests;

public record SubmitEnquiryRequest(
    string Name,
    string Email,
    string? WeddingDate,
    string? Location,
    int? GuestCount,
    string? Budget,
    string? Message,
    string? GroomName = null,
    string? ContactingFrom = null,
    bool? IsIntimate = null,
    bool? WantsConsultation = null,
    string? ConsultationAt = null);
