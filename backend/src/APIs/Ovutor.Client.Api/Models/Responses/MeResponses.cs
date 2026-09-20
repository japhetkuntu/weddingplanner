namespace Ovutor.Client.Api.Models.Responses;

public record PlannerResponse(string Name, string Role);

public record ProfileResponse(
    string PartnerA,
    string PartnerB,
    string CoupleNames,
    string PortalEmail,
    DateOnly WeddingDate,
    string Venue,
    string Status,
    PlannerResponse Planner);

public record ChecklistPhaseResponse(Guid Id, string Title, string? Description, int Order);

public record ChecklistTaskResponse(Guid Id, Guid PhaseId, string Title, string Status, string? DueDate, string? Priority, string? Note);

public record ChecklistResponse(List<ChecklistPhaseResponse> Phases, List<ChecklistTaskResponse> Tasks);

public record BudgetExpenseResponse(Guid Id, Guid CategoryId, string? Title, string Vendor, string? Description, decimal Estimated, decimal Actual, decimal Paid, string? NextDue);

public record BudgetCategoryResponse(Guid Id, string Name, decimal Estimated, decimal Actual, decimal Paid, List<BudgetExpenseResponse> Expenses);

public record BudgetResponse(decimal TotalBudget, decimal TotalEstimated, decimal TotalActual, decimal TotalPaid, decimal Remaining, string Currency, string? FullPaymentDueDate, List<BudgetCategoryResponse> Categories);

public record RsvpGuestResponse(
    Guid Id,
    string Household,
    string Status,
    int? AttendanceCount,
    string? Dietary,
    string? Note,
    string? RespondedAt,
    string? Email,
    string? Mobile,
    bool? NeedsAccommodation,
    bool? NeedsTransportation);

public record DocumentFileResponse(Guid Id, string Name, string Category, string Uploader, string SizeLabel, string UploadedAt, string? Url, string? ContentType);

public record WebsiteStatusResponse(bool IsLive, string SiteUrl);

/// <summary>A vendor is only ever shown to a couple because it's actually booked on their wedding —
/// i.e. linked via a <c>VendorId</c> on one of their own budget expenses — never the full shared
/// admin directory. Contract details stay admin-only; this is just enough for the couple to see who
/// they've booked.</summary>
public record VendorSummaryResponse(Guid Id, string Name, string? Category, string? Summary, string? Contact, string Location, string? PhotoUrl);

public record DashboardMetricsResponse(int ChecklistDone, int ChecklistTotal, decimal BudgetRemaining, string Currency, int RsvpAttending, int RsvpTotal, bool WebsiteLive);

public record UpcomingItemResponse(string Title, string Detail, string DueDate);

public record UpdateEventResponse(string Message, DateTime TimestampUtc);

public record DashboardResponse(
    DashboardMetricsResponse Metrics,
    List<UpcomingItemResponse> Upcoming,
    List<UpdateEventResponse> Updates);
