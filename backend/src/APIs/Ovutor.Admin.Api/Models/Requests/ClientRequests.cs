namespace Ovutor.Admin.Api.Models.Requests;

public record CreateClientRequest(
    string PartnerA,
    string PartnerB,
    string ContactEmail,
    string WeddingDate,
    string Venue,
    int GuestCount,
    string? WeddingType,
    string Currency,
    decimal BudgetTarget);

public record UpdateClientRequest(
    string PartnerA,
    string PartnerB,
    string WeddingDate,
    string Venue,
    int GuestCount,
    string Status,
    string Currency,
    decimal BudgetTarget);

public record UpdatePortalEmailRequest(string PortalEmail);

public record UpdateFullPaymentDueDateRequest(string? FullPaymentDueDate);

public record NotifyCoupleRequest(string Message);
