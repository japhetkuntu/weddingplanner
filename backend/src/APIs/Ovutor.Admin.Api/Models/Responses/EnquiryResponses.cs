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
    bool IsRead);
