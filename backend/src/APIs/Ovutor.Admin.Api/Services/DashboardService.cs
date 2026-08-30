using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Cache.Sdk.Services;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class DashboardService(
    IRepository<Client> clients,
    IRepository<AdminUser> adminUsers,
    IRepository<ChecklistTask> checklistTasks,
    IRepository<BudgetCategory> budgetCategories,
    IRepository<RsvpGuest> rsvpGuests,
    IRepository<MilestoneItem> milestones,
    IRepository<ActivityEvent> activityEvents,
    ICacheService cache,
    ILogger<DashboardService> logger) : IDashboardService
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public async Task<IApiResponse<DashboardResponse>> GetAsync(Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            // Cache key is per-admin: a Planner's scoped dashboard and a Super Admin's full-portfolio
            // one must never share a cache slot, or one would leak into the other for 30 seconds.
            var cacheKey = $"dashboard-summary:{requestingAdminId}";
            var cached = await cache.GetAsync<DashboardResponse>(cacheKey);
            if (cached is not null) return cached.ToOkApiResponse();

            var requester = await adminUsers.GetByIdAsync(requestingAdminId, ct) ?? throw new UnauthorizedException();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var weekOut = today.AddDays(7);
            var monthOut = today.AddDays(30);

            // A Planner only ever sees the weddings assigned to them; a Super Admin sees everything —
            // same rule the client list itself uses, so the dashboard never shows counts or attention
            // items for a wedding the signed-in admin can't otherwise open.
            var isSuperAdmin = requester.IsSuperAdmin;

            // Archived clients are hidden from the active dashboard entirely — no stale attention
            // items, RSVP deadlines, or "active weddings" count for a wedding that's been archived.
            var allClients = (await clients.FindManyAsync(c => isSuperAdmin || c.AssignedPlannerId == requestingAdminId, ct))
                .Where(c => !c.IsArchived).ToList();
            var clientsById = allClients.ToDictionary(c => c.Id);

            // Lifetime count, not scoped to the active (non-archived) portfolio above — a wedding that
            // already happened is very often archived afterward, so this must look across everything —
            // but still only within this admin's own clients unless they're a Super Admin.
            var weddingsDone = (await clients.FindManyAsync(
                c => c.WeddingDate < today && (isSuperAdmin || c.AssignedPlannerId == requestingAdminId), ct)).Count;

            var openTasks = (await checklistTasks.GetQueryable().Where(t => t.Status != "done").ToListAsync(ct))
                .Where(t => clientsById.ContainsKey(t.ClientId)).ToList();
            var dueThisWeek = openTasks.Count(t => t.DueDate is not null && t.DueDate >= today && t.DueDate <= weekOut);
            var overdue = openTasks.Count(t => t.DueDate is not null && t.DueDate < today);

            var awaitingByClient = (await rsvpGuests.GetQueryable().Where(g => g.Status == "awaiting").ToListAsync(ct))
                .Where(g => clientsById.ContainsKey(g.ClientId))
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

            var allowedClientIds = clientsById.Keys.ToList();

            var upcomingMilestones = (await milestones.GetQueryable()
                    .Where(m => allowedClientIds.Contains(m.ClientId))
                    .Include(m => m.Client).OrderBy(m => m.DueDate).Take(4).ToListAsync(ct))
                .Where(m => m.Client is not null)
                .Select(m => new MilestoneResponse(m.Client!.CoupleNames, m.Client.Id, m.Title, m.DueDate, m.Tag))
                .ToList();

            var recentActivity = (await activityEvents.GetQueryable()
                    .Where(a => a.ClientId != null && allowedClientIds.Contains(a.ClientId.Value))
                    .OrderByDescending(a => a.TimestampUtc).Take(5).ToListAsync(ct))
                .Select(a => new ActivitySummaryResponse(a.Message, a.TimestampUtc))
                .ToList();

            var response = new DashboardResponse(
                new DashboardMetrics(allClients.Count, dueThisWeek, overdue, rsvpDeadlineClients.Count, weddingsDone),
                attentionItems.Take(4).ToList(),
                upcomingMilestones,
                recentActivity);

            await cache.SetAsync(cacheKey, response, CacheTtl);
            return response.ToOkApiResponse();
        }
        catch (OvutorException) { throw; }
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
