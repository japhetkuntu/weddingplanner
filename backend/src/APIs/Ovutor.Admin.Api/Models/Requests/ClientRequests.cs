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

/// <summary>Password is optional — when the admin leaves it blank, the server generates one, same
/// as before this could be typed in.</summary>
public record ResetPortalPasswordRequest(string? Password);

public record UpdateFullPaymentDueDateRequest(string? FullPaymentDueDate);

public record NotifyCoupleRequest(string Message);
