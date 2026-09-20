using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Common.Sdk.Security;
using Ovutor.Common.Sdk.WebsiteContent;
using Ovutor.Email.Sdk.Models;
using Ovutor.Email.Sdk.Services;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class ClientService(
    IRepository<Client> clients,
    IRepository<AdminUser> adminUsers,
    IRepository<ChecklistTask> checklistTasks,
    IRepository<WebsiteSection> websiteSections,
    IRepository<WebsiteContent> websiteContents,
    IRepository<ActivityEvent> activityEvents,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<ClientService> logger) : IClientService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    /// <summary>An archived client stops showing up in the active portfolio, but a Super Admin still
    /// needs a real deletion window in case a wedding is ever undone — this is how long a client stays
    /// recoverable before it becomes eligible for a permanent delete.</summary>
    private static readonly TimeSpan DeletionEligibleAfter = TimeSpan.FromDays(90);

    private async Task<AdminUser> RequireAdminAsync(Guid requestingAdminId, CancellationToken ct) =>
        await adminUsers.GetByIdAsync(requestingAdminId, ct) ?? throw new UnauthorizedException();

    public async Task<IApiResponse<List<ClientResponse>>> GetAllAsync(Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var requester = await RequireAdminAsync(requestingAdminId, ct);
            var all = await clients.FindManyAsync(
                c => requester.IsSuperAdmin || c.AssignedPlannerId == requestingAdminId, ct);

            var planners = await PlannerNamesByIdAsync(ct);
            var percentByClient = await PlanningPercentByClientAsync(all.Select(c => c.Id).ToList(), ct);
            var result = all.OrderBy(c => c.WeddingDate)
                .Select(c => ToResponse(c, percentByClient.GetValueOrDefault(c.Id), PlannerName(c.AssignedPlannerId, planners)))
                .ToList();
            return result.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetAllAsync] Failed to list clients");
            return ApiResponseFactory.InternalError<List<ClientResponse>>("Failed to load clients.");
        }
    }

    public async Task<IApiResponse<ClientResponse>> GetByIdAsync(Guid id, Guid requestingAdminId, CancellationToken ct = default)
    {
        var requester = await RequireAdminAsync(requestingAdminId, ct);
        var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
        if (!requester.IsSuperAdmin && client.AssignedPlannerId != requestingAdminId)
            throw new ForbiddenException("This client isn't assigned to you.");

        return (await BuildResponseAsync(client, ct)).ToOkApiResponse();
    }

    public async Task<IApiResponse<ClientWithCredentialsResponse>> CreateAsync(CreateClientRequest request, Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var baseSlug = CredentialGenerator.Slugify(request.PartnerA, request.PartnerB);
            var password = CredentialGenerator.GeneratePassword();
            var coupleNames = $"{request.PartnerA} & {request.PartnerB}";

            // UniqueSlugAsync's own check is only a pre-check, not a guarantee — two admins could
            // both pass it for the same base slug in the same instant. The database's unique index
            // on Slug is what actually rules out a duplicate ever being persisted; this retry loop
            // just means the loser of that race gets a different slug and still succeeds, instead
            // of a raw 500 from the constraint violation.
            const int maxAttempts = 5;
            Client client = null!;
            for (var attempt = 1; ; attempt++)
            {
                var slug = await UniqueSlugAsync(baseSlug, ct);
                client = new Client
                {
                    Slug = slug,
                    CoupleNames = coupleNames,
                    PartnerA = request.PartnerA,
                    PartnerB = request.PartnerB,
                    WeddingDate = DateOnly.Parse(request.WeddingDate),
                    Venue = request.Venue,
                    GuestCount = request.GuestCount,
                    WeddingType = string.IsNullOrWhiteSpace(request.WeddingType) ? null : request.WeddingType,
                    Status = "early-planning",
                    PlanningPercent = 0,
                    BudgetTotal = request.BudgetTarget,
                    BudgetPaid = 0,
                    Currency = request.Currency,
                    NextAttention = "Book venue walkthrough",
                    AvatarInitials = $"{request.PartnerA.FirstOrDefault()}{request.PartnerB.FirstOrDefault()}".ToUpperInvariant(),
                    PortalEmail = request.ContactEmail.Trim().ToLowerInvariant(),
                    PortalPasswordHash = PasswordHasher.Hash(password),
                    AssignedPlannerId = requestingAdminId,
                };

                try
                {
                    await clients.AddAsync(client, ct);
                    break;
                }
                catch (DbUpdateException e) when (attempt < maxAttempts && IsSlugConflict(e))
                {
                    logger.LogWarning("[CreateAsync] Slug '{Slug}' collided with a concurrent create — retrying ({Attempt}/{Max}).", slug, attempt, maxAttempts);
                }
            }

            for (var i = 0; i < WebsiteContentTemplates.SectionTemplate.Length; i++)
            {
                var (key, title, description) = WebsiteContentTemplates.SectionTemplate[i];
                await websiteSections.AddAsync(new WebsiteSection { ClientId = client.Id, Key = key, Order = i + 1, Title = title, Description = description, Status = "draft" }, ct);
            }

            await websiteContents.AddAsync(new WebsiteContent
            {
                ClientId = client.Id,
                HeroJson = JsonSerializer.Serialize(WebsiteContentTemplates.HeroTemplate(coupleNames), JsonOptions),
                OurStoryJson = JsonSerializer.Serialize(WebsiteContentTemplates.OurStoryTemplate(), JsonOptions),
                DetailsJson = JsonSerializer.Serialize(WebsiteContentTemplates.DetailsTemplate(), JsonOptions),
                ScheduleJson = JsonSerializer.Serialize(WebsiteContentTemplates.ScheduleTemplate(), JsonOptions),
                TravelJson = JsonSerializer.Serialize(WebsiteContentTemplates.TravelTemplate(), JsonOptions),
                GalleryJson = JsonSerializer.Serialize(WebsiteContentTemplates.GalleryTemplate(), JsonOptions),
                RsvpJson = JsonSerializer.Serialize(WebsiteContentTemplates.RsvpTemplate(), JsonOptions),
            }, ct);

            var portalUrl = $"{configuration["Frontend:ClientPortalUrl"] ?? "https://client.ovutor.com"}/{client.Slug}";
            var credentials = new ClientCredentialsResponse(portalUrl, client.PortalEmail, password);
            return new ClientWithCredentialsResponse(await BuildResponseAsync(client, ct), credentials).ToCreatedApiResponse("Client workspace created.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[CreateAsync] Failed to create client");
            return ApiResponseFactory.InternalError<ClientWithCredentialsResponse>("Failed to create client.");
        }
    }

    public async Task<IApiResponse<ClientResponse>> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            client.PartnerA = request.PartnerA;
            client.PartnerB = request.PartnerB;
            client.CoupleNames = $"{request.PartnerA} & {request.PartnerB}";
            client.WeddingDate = DateOnly.Parse(request.WeddingDate);
            client.Venue = request.Venue;
            client.GuestCount = request.GuestCount;
            client.Status = request.Status;
            client.Currency = request.Currency;
            client.BudgetTotal = request.BudgetTarget;
            await clients.UpdateAsync(client, ct);
            return (await BuildResponseAsync(client, ct)).ToOkApiResponse("Client details saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateAsync] Failed to update client {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientResponse>("Failed to save client details.");
        }
    }

    public async Task<IApiResponse<ClientResponse>> UpdateFullPaymentDueDateAsync(Guid id, UpdateFullPaymentDueDateRequest request, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            client.FullPaymentDueDate = string.IsNullOrWhiteSpace(request.FullPaymentDueDate) ? null : DateOnly.Parse(request.FullPaymentDueDate);
            await clients.UpdateAsync(client, ct);
            return (await BuildResponseAsync(client, ct)).ToOkApiResponse("Due date saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateFullPaymentDueDateAsync] Failed to update due date for {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientResponse>("Failed to save due date.");
        }
    }

    public async Task<IApiResponse<ClientResponse>> UpdatePortalEmailAsync(Guid id, UpdatePortalEmailRequest request, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            client.PortalEmail = request.PortalEmail.Trim().ToLowerInvariant();
            await clients.UpdateAsync(client, ct);
            return (await BuildResponseAsync(client, ct)).ToOkApiResponse("Portal email saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdatePortalEmailAsync] Failed to update portal email for {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientResponse>("Failed to save portal email.");
        }
    }

    public async Task<IApiResponse<ClientCredentialsResponse>> ResetPortalPasswordAsync(Guid id, ResetPortalPasswordRequest request, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");

            var typedPassword = request.Password?.Trim();
            if (!string.IsNullOrEmpty(typedPassword) && typedPassword.Length < 8)
                return ApiResponseFactory.BadRequest<ClientCredentialsResponse>("Password must be at least 8 characters.");

            var password = string.IsNullOrEmpty(typedPassword) ? CredentialGenerator.GeneratePassword() : typedPassword;
            client.PortalPasswordHash = PasswordHasher.Hash(password);
            await clients.UpdateAsync(client, ct);

            var portalUrl = $"{configuration["Frontend:ClientPortalUrl"] ?? "https://client.ovutor.com"}/{client.Slug}";
            var message = string.IsNullOrEmpty(typedPassword) ? "New password generated — copy and share it with the couple." : "Password saved — copy and share it with the couple.";
            return new ClientCredentialsResponse(portalUrl, client.PortalEmail, password).ToOkApiResponse(message);
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[ResetPortalPasswordAsync] Failed to reset password for {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientCredentialsResponse>("Failed to reset password.");
        }
    }

    public async Task<IApiResponse<ClientResponse>> ArchiveAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            client.IsArchived = true;
            client.ArchivedAtUtc = DateTime.UtcNow;
            await clients.UpdateAsync(client, ct);
            return (await BuildResponseAsync(client, ct)).ToOkApiResponse("Client archived.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[ArchiveAsync] Failed to archive client {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientResponse>("Failed to archive this client.");
        }
    }

    public async Task<IApiResponse<ClientResponse>> UnarchiveAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            client.IsArchived = false;
            client.ArchivedAtUtc = null;
            await clients.UpdateAsync(client, ct);
            return (await BuildResponseAsync(client, ct)).ToOkApiResponse("Client unarchived.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UnarchiveAsync] Failed to unarchive client {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientResponse>("Failed to unarchive this client.");
        }
    }

    /// <summary>Hard-deletes an archived client — Super Admin only, and only once the client has sat
    /// archived for at least <see cref="DeletionEligibleAfter"/>, so this is never the first line of
    /// defense against a mistaken archive.</summary>
    public async Task<IApiResponse<object>> DeleteAsync(Guid id, Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var requester = await RequireAdminAsync(requestingAdminId, ct);
            if (!requester.IsSuperAdmin) return ApiResponseFactory.Forbidden<object>("Only a Super Admin can permanently delete a client.");

            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            if (!client.IsArchived || client.ArchivedAtUtc is null)
                return ApiResponseFactory.BadRequest<object>("Archive this client first — only archived clients can be deleted.");

            var archivedFor = DateTime.UtcNow - client.ArchivedAtUtc.Value;
            if (archivedFor < DeletionEligibleAfter)
            {
                var daysLeft = (int)Math.Ceiling((DeletionEligibleAfter - archivedFor).TotalDays);
                return ApiResponseFactory.BadRequest<object>($"This client can be permanently deleted in {daysLeft} more day(s) — archived clients are kept for {DeletionEligibleAfter.Days} days first.");
            }

            await clients.RemoveAsync(client, ct);
            return new object().ToOkApiResponse("Client permanently deleted.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[DeleteAsync] Failed to delete client {ClientId}", id);
            return ApiResponseFactory.InternalError<object>("Failed to delete this client.");
        }
    }

    /// <summary>No email provider is wired up yet (see backend scope note on AdminUser's password
    /// reset) — this logs what would have been emailed and drops the message into the couple's
    /// activity feed, so they still see it in their portal the moment they next open it. Swapping in
    /// a real provider later only means adding an actual send call here.</summary>
    public async Task<IApiResponse<object>> NotifyCoupleAsync(Guid id, Guid requestingAdminId, NotifyCoupleRequest request, CancellationToken ct = default)
    {
        try
        {
            var message = request.Message.Trim();
            if (string.IsNullOrEmpty(message)) return ApiResponseFactory.BadRequest<object>("Enter what changed before sending.");

            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            var planner = await adminUsers.GetByIdAsync(requestingAdminId, ct);

            await activityEvents.AddAsync(new ActivityEvent { ClientId = client.Id, Message = message, TimestampUtc = DateTime.UtcNow }, ct);

            var portalUrl = $"{configuration["Frontend:ClientPortalUrl"] ?? "https://client.ovutor.com"}/dashboard";
            var emailResult = await emailService.SendAsync(
                to: [new EmailContact(client.PortalEmail, client.CoupleNames)],
                subject: $"An update on your wedding — {client.CoupleNames}",
                templateId: "couple-update",
                variables: new Dictionary<string, string>
                {
                    ["couple_names"] = client.CoupleNames,
                    ["planner_name"] = planner?.Name ?? "Your Ovutor planner",
                    ["message"] = message,
                    ["portal_url"] = portalUrl,
                },
                ct: ct);

            // A skipped send (no Mailtrap key configured yet) is expected in Development — the update
            // still lands in the couple's portal via the activity event above, so it's never lost,
            // just not also emailed until a provider is wired up.
            if (!emailResult.Sent && !emailResult.Skipped)
                logger.LogWarning("[NotifyCoupleAsync] Email send failed for {ClientId}, but the portal update was still saved: {Error}", id, emailResult.Error);

            return new object().ToOkApiResponse(emailResult.Sent ? "Update emailed and saved to the couple's portal." : "Update sent to the couple's portal.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[NotifyCoupleAsync] Failed to notify couple for {ClientId}", id);
            return ApiResponseFactory.InternalError<object>("Failed to send that update.");
        }
    }

    private static bool IsSlugConflict(DbUpdateException e) =>
        e.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg
        && pg.ConstraintName == "IX_Clients_Slug";

    private async Task<string> UniqueSlugAsync(string baseSlug, CancellationToken ct)
    {
        var slug = baseSlug;
        var suffix = 1;
        while (await clients.ExistsAsync(c => c.Slug == slug, ct))
        {
            suffix++;
            slug = $"{baseSlug}-{suffix}";
        }
        return slug;
    }

    private async Task<int> PlanningPercentAsync(Guid clientId, CancellationToken ct)
    {
        var tasks = await checklistTasks.GetQueryable().Where(t => t.ClientId == clientId).ToListAsync(ct);
        return tasks.Count == 0 ? 0 : (int)Math.Round(tasks.Count(t => t.Status == "done") * 100.0 / tasks.Count);
    }

    /// <summary>Batched for the portfolio list so it's one query for every client instead of one per row.</summary>
    private async Task<Dictionary<Guid, int>> PlanningPercentByClientAsync(List<Guid> clientIds, CancellationToken ct)
    {
        var tasks = await checklistTasks.GetQueryable().Where(t => clientIds.Contains(t.ClientId)).ToListAsync(ct);
        return tasks.GroupBy(t => t.ClientId).ToDictionary(
            g => g.Key,
            g => (int)Math.Round(g.Count(t => t.Status == "done") * 100.0 / g.Count()));
    }

    private async Task<Dictionary<Guid, string>> PlannerNamesByIdAsync(CancellationToken ct) =>
        (await adminUsers.GetQueryable().ToListAsync(ct)).ToDictionary(a => a.Id, a => a.Name);

    private static string? PlannerName(Guid? plannerId, Dictionary<Guid, string> planners) =>
        plannerId.HasValue && planners.TryGetValue(plannerId.Value, out var name) ? name : null;

    private async Task<ClientResponse> BuildResponseAsync(Client c, CancellationToken ct)
    {
        var percent = await PlanningPercentAsync(c.Id, ct);
        var plannerName = c.AssignedPlannerId.HasValue ? (await adminUsers.GetByIdAsync(c.AssignedPlannerId.Value, ct))?.Name : null;
        return ToResponse(c, percent, plannerName);
    }

    private static ClientResponse ToResponse(Client c, int planningPercent, string? assignedPlannerName) => new(
        c.Id, c.Slug, c.CoupleNames, c.PartnerA, c.PartnerB, c.WeddingDate, c.Venue, c.GuestCount, c.WeddingType, c.Status,
        planningPercent, c.BudgetTotal, c.BudgetPaid, c.FullPaymentDueDate, c.Currency, c.NextAttention, c.AvatarInitials, c.PortalEmail, c.IsArchived,
        c.AssignedPlannerId, assignedPlannerName);
}
