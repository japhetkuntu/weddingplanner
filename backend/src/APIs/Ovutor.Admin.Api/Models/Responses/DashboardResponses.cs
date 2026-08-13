namespace Ovutor.Admin.Api.Models.Responses;

public record DashboardMetrics(int ActiveWeddings, int DueThisWeek, int Overdue, int RsvpDeadlines);

public record AttentionItemResponse(string Tag, string Title, string Detail, Guid ClientId, string Area);

public record MilestoneResponse(string ClientCoupleNames, Guid ClientId, string Title, DateOnly DueDate, string Tag);

public record ActivitySummaryResponse(string Message, DateTime TimestampUtc);

public record DashboardResponse(
    DashboardMetrics Metrics,
    List<AttentionItemResponse> AttentionItems,
    List<MilestoneResponse> UpcomingMilestones,
    List<ActivitySummaryResponse> RecentActivity);

public record ClientActivityResponse(
    List<MilestoneResponse> Milestones,
    List<ActivitySummaryResponse> Activity);
