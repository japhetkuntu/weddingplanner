namespace Ovutor.Admin.Api.Models.Responses;

public record ClientResponse(
    Guid Id,
    string Slug,
    string CoupleNames,
    string PartnerA,
    string PartnerB,
    DateOnly WeddingDate,
    string Venue,
    int GuestCount,
    string Status,
    int PlanningPercent,
    decimal BudgetTotal,
    decimal BudgetPaid,
    DateOnly? FullPaymentDueDate,
    string Currency,
    string NextAttention,
    string AvatarInitials,
    string PortalEmail,
    bool IsArchived);

/// <summary>Only ever returned right after creating a client or resetting their password — the plaintext
/// is never stored, so this is the one moment the admin can see/copy it.</summary>
public record ClientCredentialsResponse(string PortalUrl, string PortalEmail, string PortalPassword);

public record ClientWithCredentialsResponse(ClientResponse Client, ClientCredentialsResponse Credentials);
