using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Cache.Sdk.Services;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class DashboardService(
    IRepository<Client> clients,
    IRepository<ChecklistTask> checklistTasks,
    IRepository<BudgetCategory> budgetCategories,
    IRepository<RsvpGuest> rsvpGuests,
    IRepository<MilestoneItem> milestones,
    IRepository<ActivityEvent> activityEvents,
    ICacheService cache,
    ILogger<DashboardService> logger) : IDashboardService
{
    private const string CacheKey = "dashboard-summary";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public async Task<IApiResponse<DashboardResponse>> GetAsync(CancellationToken ct = default)
    {
        try
        {
            var cached = await cache.GetAsync<DashboardResponse>(CacheKey);
            if (cached is not null) return cached.ToOkApiResponse();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var weekOut = today.AddDays(7);
            var monthOut = today.AddDays(30);

            // Archived clients are hidden from the active dashboard entirely — no stale attention
            // items, RSVP deadlines, or "active weddings" count for a wedding that's been archived.
            var allClients = (await clients.FindManyAsync(_ => true, ct)).Where(c => !c.IsArchived).ToList();
            var clientsById = allClients.ToDictionary(c => c.Id);

            // Lifetime count, not scoped to the active (non-archived) portfolio above — a wedding that
            // already happened is very often archived afterward, so this must look across everything.
            var weddingsDone = (await clients.FindManyAsync(c => c.WeddingDate < today, ct)).Count;

            var openTasks = await checklistTasks.GetQueryable().Where(t => t.Status != "done").ToListAsync(ct);
            var dueThisWeek = openTasks.Count(t => t.DueDate is not null && t.DueDate >= today && t.DueDate <= weekOut);
            var overdue = openTasks.Count(t => t.DueDate is not null && t.DueDate < today);

            var awaitingByClient = (await rsvpGuests.GetQueryable().Where(g => g.Status == "awaiting").ToListAsync(ct))
                .GroupBy(g => g.ClientId).ToDictionary(g => g.Key, g => g.Count());
            var rsvpDeadlineClients = allClients.Where(c => awaitingByClient.ContainsKey(c.Id) && c.WeddingDate <= monthOut).ToList();

            var attentionItems = new List<AttentionItemResponse>();

            var atRiskTasks = openTasks
                .Where(t => t.Priority == "at-risk" && clientsById.ContainsKey(t.ClientId))
                .OrderBy(t => t.DueDate ?? DateOnly.MaxValue)
                .Take(2);
            foreach (var task in atRiskTasks)
            {
                var client = clientsById[task.ClientId];
                var overdueTag = task.DueDate is not null && task.DueDate < today;
                attentionItems.Add(new AttentionItemResponse(
                    $"{(overdueTag ? "OVERDUE" : "AT RISK")} · {client.CoupleNames.ToUpperInvariant()}",
                    task.Title, task.Note ?? "Open checklist", client.Id, "checklist"));
            }

            var categoriesWithExpenses = await budgetCategories.GetQueryable().Include(c => c.Expenses).ToListAsync(ct);
            foreach (var category in categoriesWithExpenses)
            {
                if (!clientsById.TryGetValue(category.ClientId, out var client)) continue;
                var planned = category.Expenses.Sum(e => e.Estimated);
                var agreed = category.Expenses.Sum(e => e.Actual);
                if (agreed > planned && planned > 0)
                {
                    attentionItems.Add(new AttentionItemResponse(
                        $"BUDGET WATCH · {client.CoupleNames.ToUpperInvariant()}",
                        $"{category.Name} is {(agreed - planned):C0} over target", "Review category allocation", client.Id, "budget"));
                }
                if (attentionItems.Count >= 3) break;
            }

            foreach (var client in rsvpDeadlineClients.Take(1))
            {
                attentionItems.Add(new AttentionItemResponse(
                    $"RSVP DEADLINE · {client.CoupleNames.ToUpperInvariant()}",
                    $"{awaitingByClient[client.Id]} guests have not responded", "View RSVP follow-up", client.Id, "rsvps"));
            }

            var upcomingMilestones = (await milestones.GetQueryable().Include(m => m.Client).OrderBy(m => m.DueDate).Take(4).ToListAsync(ct))
                .Where(m => m.Client is not null)
                .Select(m => new MilestoneResponse(m.Client!.CoupleNames, m.Client.Id, m.Title, m.DueDate, m.Tag))
                .ToList();

            var recentActivity = (await activityEvents.GetQueryable().OrderByDescending(a => a.TimestampUtc).Take(5).ToListAsync(ct))
                .Select(a => new ActivitySummaryResponse(a.Message, a.TimestampUtc))
                .ToList();

            var response = new DashboardResponse(
                new DashboardMetrics(allClients.Count, dueThisWeek, overdue, rsvpDeadlineClients.Count, weddingsDone),
                attentionItems.Take(4).ToList(),
                upcomingMilestones,
                recentActivity);

            await cache.SetAsync(CacheKey, response, CacheTtl);
            return response.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetAsync] Failed to build dashboard");
            return ApiResponseFactory.InternalError<DashboardResponse>("Failed to load dashboard.");
        }
    }

    public async Task<IApiResponse<ClientActivityResponse>> GetForClientAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(clientId, ct);
            if (client is null) return ApiResponseFactory.NotFound<ClientActivityResponse>("We couldn't find that client.");

            var clientMilestones = (await milestones.GetQueryable().Where(m => m.ClientId == clientId).OrderBy(m => m.DueDate).Take(5).ToListAsync(ct))
                .Select(m => new MilestoneResponse(client.CoupleNames, client.Id, m.Title, m.DueDate, m.Tag))
                .ToList();

            var clientActivity = (await activityEvents.GetQueryable().Where(a => a.ClientId == clientId).OrderByDescending(a => a.TimestampUtc).Take(5).ToListAsync(ct))
                .Select(a => new ActivitySummaryResponse(a.Message, a.TimestampUtc))
                .ToList();

            return new ClientActivityResponse(clientMilestones, clientActivity).ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetForClientAsync] Failed to load activity for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<ClientActivityResponse>("Failed to load activity.");
        }
    }
}
