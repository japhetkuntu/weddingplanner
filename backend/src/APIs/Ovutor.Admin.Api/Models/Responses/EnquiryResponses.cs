namespace Ovutor.Admin.Api.Models.Responses;

public record EnquiryResponse(
    Guid Id,
    string Name,
    string Email,
    string? WeddingDate,
    string? Location,
    int? GuestCount,
    string? Budget,
    string? Message,
    string SubmittedAt,
    bool IsRead,
    string? GroomName = null,
    string? ContactingFrom = null,
    bool? IsIntimate = null,
    bool? WantsConsultation = null,
    string? ConsultationAt = null);
