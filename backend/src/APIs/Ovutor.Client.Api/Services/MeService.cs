using Microsoft.EntityFrameworkCore;
using Ovutor.Client.Api.Interfaces;
using Ovutor.Client.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;
using Ovutor.Storage.Sdk;
using ClientEntity = Ovutor.Postgres.Sdk.Entities.Client;

namespace Ovutor.Client.Api.Services;

public class MeService(
    IRepository<ClientEntity> clients,
    IRepository<AdminUser> adminUsers,
    IRepository<ChecklistPhase> checklistPhases,
    IRepository<ChecklistTask> checklistTasks,
    IRepository<BudgetCategory> budgetCategories,
    IRepository<BudgetExpense> budgetExpenses,
    IRepository<RsvpGuest> rsvpGuests,
    IRepository<DocumentFile> documents,
    IRepository<WebsiteSection> websiteSections,
    IRepository<ActivityEvent> activityEvents,
    IStorageService storageService,
    IConfiguration configuration,
    ILogger<MeService> logger) : IMeService
{
    public async Task<IApiResponse<ProfileResponse>> GetProfileAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(clientId, ct) ?? throw new NotFoundException("We couldn't find your workspace.");
            var planner = await adminUsers.GetQueryable().FirstOrDefaultAsync(ct);
            var plannerResponse = planner is null ? new PlannerResponse("Your Ovutor planner", "Lead planner") : new PlannerResponse(planner.Name, planner.Role);

            var response = new ProfileResponse(
                client.PartnerA, client.PartnerB, client.CoupleNames, client.PortalEmail,
                client.WeddingDate, client.Venue, client.Status, plannerResponse);
            return response.ToOkApiResponse();
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[GetProfileAsync] Failed to load profile for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<ProfileResponse>("Failed to load your profile.");
        }
    }

    public async Task<IApiResponse<ChecklistResponse>> GetChecklistAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var phases = await checklistPhases.GetQueryable().Where(p => p.ClientId == clientId).OrderBy(p => p.Order).ToListAsync(ct);
            var tasks = await checklistTasks.GetQueryable().Where(t => t.ClientId == clientId).ToListAsync(ct);

            var response = new ChecklistResponse(
                phases.Select(p => new ChecklistPhaseResponse(p.Id, p.Title, p.Description, p.Order)).ToList(),
                tasks.Select(t => new ChecklistTaskResponse(t.Id, t.PhaseId, t.Title, t.Status, t.DueDate?.ToString("yyyy-MM-dd"), t.Priority, t.Note)).ToList());
            return response.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetChecklistAsync] Failed to load checklist for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<ChecklistResponse>("Failed to load your checklist.");
        }
    }

    public async Task<IApiResponse<BudgetResponse>> GetBudgetAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(clientId, ct) ?? throw new NotFoundException("We couldn't find your workspace.");
            var categories = await budgetCategories.GetQueryable().Where(c => c.ClientId == clientId).ToListAsync(ct);
            var categoryIds = categories.Select(c => c.Id).ToList();
            var expenses = await budgetExpenses.GetQueryable().Where(e => categoryIds.Contains(e.CategoryId)).ToListAsync(ct);

            var categoryResponses = categories.Select(c =>
            {
                var catExpenses = expenses.Where(e => e.CategoryId == c.Id).ToList();
                var committed = catExpenses.Sum(e => e.Agreed);
                var trend = catExpenses.Sum(e => e.Agreed) > catExpenses.Sum(e => e.Planned) ? "up" : "down";
                return new BudgetCategoryResponse(
                    c.Id, c.Name, committed, trend,
                    catExpenses.Select(e => new BudgetExpenseResponse(e.Id, e.CategoryId, e.Vendor, e.Description, e.Agreed, e.Paid, e.NextDue?.ToString("yyyy-MM-dd"))).ToList());
            }).ToList();

            var totalCommitted = categoryResponses.Sum(c => c.Committed);
            var response = new BudgetResponse(client.BudgetTotal, totalCommitted, client.BudgetTotal - totalCommitted, categoryResponses);
            return response.ToOkApiResponse();
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[GetBudgetAsync] Failed to load budget for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<BudgetResponse>("Failed to load your budget.");
        }
    }

    public async Task<IApiResponse<List<RsvpGuestResponse>>> GetRsvpsAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var guests = await rsvpGuests.GetQueryable().Where(g => g.ClientId == clientId).ToListAsync(ct);
            var response = guests
                .Select(g => new RsvpGuestResponse(g.Id, g.Household, g.Status, g.AttendanceCount, g.Dietary, g.PlannerNote, g.RespondedAtUtc?.ToString("yyyy-MM-dd")))
                .ToList();
            return response.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetRsvpsAsync] Failed to load RSVPs for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<List<RsvpGuestResponse>>("Failed to load your RSVPs.");
        }
    }

    public async Task<IApiResponse<List<DocumentFileResponse>>> GetDocumentsAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var files = await documents.GetQueryable().Where(d => d.ClientId == clientId && d.Visibility == "client").ToListAsync(ct);
            var response = files
                .Select(d => new DocumentFileResponse(
                    d.Id, d.Name, d.Category, d.Uploader, d.SizeLabel, d.UploadedAtUtc.ToString("yyyy-MM-dd"),
                    string.IsNullOrWhiteSpace(d.StoragePath) ? null : storageService.BuildPublicUrl(d.StoragePath),
                    d.ContentType))
                .ToList();
            return response.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetDocumentsAsync] Failed to load documents for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<List<DocumentFileResponse>>("Failed to load your documents.");
        }
    }

    public async Task<IApiResponse<WebsiteStatusResponse>> GetWebsiteStatusAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(clientId, ct) ?? throw new NotFoundException("We couldn't find your workspace.");
            var sections = await websiteSections.GetQueryable().Where(s => s.ClientId == clientId).ToListAsync(ct);
            var isLive = sections.Count > 0 && sections.All(s => s.Status == "published");
            var siteUrl = $"{configuration["Frontend:WeddingWebsiteUrl"] ?? "https://ovutor.com"}/{client.Slug}";
            return new WebsiteStatusResponse(isLive, siteUrl).ToOkApiResponse();
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[GetWebsiteStatusAsync] Failed to load website status for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<WebsiteStatusResponse>("Failed to load your website status.");
        }
    }

    public async Task<IApiResponse<DashboardResponse>> GetDashboardAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(clientId, ct) ?? throw new NotFoundException("We couldn't find your workspace.");

            var tasks = await checklistTasks.GetQueryable().Where(t => t.ClientId == clientId).ToListAsync(ct);
            var checklistDone = tasks.Count(t => t.Status == "done");

            var categories = await budgetCategories.GetQueryable().Where(c => c.ClientId == clientId).ToListAsync(ct);
            var categoryIds = categories.Select(c => c.Id).ToList();
            var expenses = await budgetExpenses.GetQueryable().Where(e => categoryIds.Contains(e.CategoryId)).ToListAsync(ct);
            var committed = expenses.Sum(e => e.Agreed);

            var guests = await rsvpGuests.GetQueryable().Where(g => g.ClientId == clientId).ToListAsync(ct);
            var rsvpAttending = guests.Count(g => g.Status != "awaiting");

            var sections = await websiteSections.GetQueryable().Where(s => s.ClientId == clientId).ToListAsync(ct);
            var websiteLive = sections.Count > 0 && sections.All(s => s.Status == "published");

            var upcoming = tasks
                .Where(t => t.Status == "open" && t.DueDate is not null)
                .OrderBy(t => t.DueDate)
                .Take(3)
                .Select(t => new UpcomingItemResponse(t.Title, t.Note ?? "Your response needed", t.DueDate!.Value.ToString("yyyy-MM-dd")))
                .ToList();

            var updates = (await activityEvents.GetQueryable().Where(a => a.ClientId == clientId).OrderByDescending(a => a.TimestampUtc).Take(5).ToListAsync(ct))
                .Select(a => new UpdateEventResponse(a.Message, a.TimestampUtc))
                .ToList();

            var metrics = new DashboardMetricsResponse(checklistDone, tasks.Count, client.BudgetTotal - committed, rsvpAttending, guests.Count, websiteLive);
            return new DashboardResponse(metrics, upcoming, updates).ToOkApiResponse();
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[GetDashboardAsync] Failed to load dashboard for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<DashboardResponse>("Failed to load your dashboard.");
        }
    }
}
