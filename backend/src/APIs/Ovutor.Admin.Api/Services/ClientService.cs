using System.Text.Json;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Common.Sdk.Security;
using Ovutor.Common.Sdk.WebsiteContent;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class ClientService(
    IRepository<Client> clients,
    IRepository<ChecklistPhase> checklistPhases,
    IRepository<WebsiteSection> websiteSections,
    IRepository<WebsiteContent> websiteContents,
    IConfiguration configuration,
    ILogger<ClientService> logger) : IClientService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<IApiResponse<List<ClientResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        try
        {
            var all = await clients.FindManyAsync(_ => true, ct);
            var result = all.OrderBy(c => c.WeddingDate).Select(ToResponse).ToList();
            return result.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetAllAsync] Failed to list clients");
            return ApiResponseFactory.InternalError<List<ClientResponse>>("Failed to load clients.");
        }
    }

    public async Task<IApiResponse<ClientResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
        return ToResponse(client).ToOkApiResponse();
    }

    public async Task<IApiResponse<ClientWithCredentialsResponse>> CreateAsync(CreateClientRequest request, CancellationToken ct = default)
    {
        try
        {
            var slug = await UniqueSlugAsync(CredentialGenerator.Slugify(request.PartnerA, request.PartnerB), ct);
            var password = CredentialGenerator.GeneratePassword();
            var coupleNames = $"{request.PartnerA} & {request.PartnerB}";

            var client = new Client
            {
                Slug = slug,
                CoupleNames = coupleNames,
                PartnerA = request.PartnerA,
                PartnerB = request.PartnerB,
                WeddingDate = DateOnly.Parse(request.WeddingDate),
                Venue = request.Venue,
                GuestCount = request.GuestCount,
                Status = "early-planning",
                PlanningPercent = 2,
                BudgetTotal = request.BudgetTarget,
                BudgetPaid = 0,
                Currency = request.Currency,
                NextAttention = "Book venue walkthrough",
                AvatarInitials = $"{request.PartnerA.FirstOrDefault()}{request.PartnerB.FirstOrDefault()}".ToUpperInvariant(),
                PortalEmail = request.ContactEmail.Trim().ToLowerInvariant(),
                PortalPasswordHash = PasswordHasher.Hash(password),
            };
            await clients.AddAsync(client, ct);

            var defaultPhases = new[] { "I. Set the foundation", "II. Secure your team", "III. Shape the celebration", "IV. Finalize the details" };
            for (var i = 0; i < defaultPhases.Length; i++)
            {
                await checklistPhases.AddAsync(new ChecklistPhase { ClientId = client.Id, Title = defaultPhases[i], Order = i + 1 }, ct);
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

            var portalUrl = $"{configuration["Frontend:ClientPortalUrl"] ?? "https://portal.ovutor.com"}/{client.Slug}";
            var credentials = new ClientCredentialsResponse(portalUrl, client.PortalEmail, password);
            return new ClientWithCredentialsResponse(ToResponse(client), credentials).ToCreatedApiResponse("Client workspace created.");
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
            await clients.UpdateAsync(client, ct);
            return ToResponse(client).ToOkApiResponse("Client details saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateAsync] Failed to update client {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientResponse>("Failed to save client details.");
        }
    }

    public async Task<IApiResponse<ClientResponse>> UpdatePortalEmailAsync(Guid id, UpdatePortalEmailRequest request, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            client.PortalEmail = request.PortalEmail.Trim().ToLowerInvariant();
            await clients.UpdateAsync(client, ct);
            return ToResponse(client).ToOkApiResponse("Portal email saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdatePortalEmailAsync] Failed to update portal email for {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientResponse>("Failed to save portal email.");
        }
    }

    public async Task<IApiResponse<ClientCredentialsResponse>> ResetPortalPasswordAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that client.");
            var password = CredentialGenerator.GeneratePassword();
            client.PortalPasswordHash = PasswordHasher.Hash(password);
            await clients.UpdateAsync(client, ct);

            var portalUrl = $"{configuration["Frontend:ClientPortalUrl"] ?? "https://portal.ovutor.com"}/{client.Slug}";
            return new ClientCredentialsResponse(portalUrl, client.PortalEmail, password).ToOkApiResponse("New password generated — copy and share it with the couple.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[ResetPortalPasswordAsync] Failed to reset password for {ClientId}", id);
            return ApiResponseFactory.InternalError<ClientCredentialsResponse>("Failed to reset password.");
        }
    }

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

    private static ClientResponse ToResponse(Client c) => new(
        c.Id, c.Slug, c.CoupleNames, c.PartnerA, c.PartnerB, c.WeddingDate, c.Venue, c.GuestCount, c.Status,
        c.PlanningPercent, c.BudgetTotal, c.BudgetPaid, c.Currency, c.NextAttention, c.AvatarInitials, c.PortalEmail);
}
