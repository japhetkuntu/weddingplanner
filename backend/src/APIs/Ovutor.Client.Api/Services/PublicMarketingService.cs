using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Ovutor.Client.Api.Interfaces;
using Ovutor.Client.Api.Models.Requests;
using Ovutor.Client.Api.Models.Responses;
using Ovutor.Common.Sdk.MarketingContent;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Client.Api.Services;

/// <summary>Serves the studio's own admin-authored marketing content — distinct from PublicSiteService,
/// which serves a couple's wedding site. Never 404s: a page nobody has edited yet is a normal,
/// meaningful state (returns null hero / no sections), since apps/wedding-website falls back to its
/// own static content per field rather than treating "nothing admin-authored" as an error.</summary>
public class PublicMarketingService(
    IRepository<MarketingFixedContent> fixedContents,
    IRepository<MarketingSection> sections,
    IRepository<MarketingEnquiry> enquiries,
    ILogger<PublicMarketingService> logger) : IPublicMarketingService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<IApiResponse<PublicMarketingPageResponse>> GetPageAsync(string pageSlug, CancellationToken ct = default)
    {
        try
        {
            var contentEntities = await fixedContents.GetQueryable().Where(c => c.PageSlug == pageSlug).ToListAsync(ct);
            var content = contentEntities.ToDictionary(c => c.Key, c => JsonDocument.Parse(c.ContentJson).RootElement);

            var sectionEntities = await sections.GetQueryable()
                .Where(s => s.PageSlug == pageSlug && s.IsEnabled)
                .OrderBy(s => s.Order)
                .ToListAsync(ct);

            var publicSections = sectionEntities.Select(s =>
            {
                var block = JsonSerializer.Deserialize<MarketingContentBlock>(s.ContentJson, JsonOptions)!;
                return new PublicMarketingSection(s.Id, s.Type, block.Heading, block.Body, ToPublicImage(block.Image), block.Layout);
            }).ToList();

            return new PublicMarketingPageResponse(content, publicSections).ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetPageAsync] Failed to load marketing content for {PageSlug}", pageSlug);
            return ApiResponseFactory.InternalError<PublicMarketingPageResponse>("Failed to load page content.");
        }
    }

    public async Task<IApiResponse<object>> SubmitEnquiryAsync(SubmitEnquiryRequest request, CancellationToken ct = default)
    {
        try
        {
            var name = request.Name?.Trim();
            var email = request.Email?.Trim();
            if (string.IsNullOrEmpty(name)) return ApiResponseFactory.BadRequest<object>("Please tell us your name.");
            if (string.IsNullOrEmpty(email)) return ApiResponseFactory.BadRequest<object>("Please share an email address.");

            var enquiry = new MarketingEnquiry
            {
                Name = name,
                Email = email,
                WeddingDate = string.IsNullOrWhiteSpace(request.WeddingDate) ? null : request.WeddingDate,
                Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location,
                GuestCount = request.GuestCount,
                Budget = string.IsNullOrWhiteSpace(request.Budget) ? null : request.Budget,
                Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message,
            };
            await enquiries.AddAsync(enquiry, ct);

            return new object().ToCreatedApiResponse("Enquiry received.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[SubmitEnquiryAsync] Failed to save an enquiry from {Email}", request.Email);
            return ApiResponseFactory.InternalError<object>("Failed to send your enquiry.");
        }
    }

    private static PublicMarketingImage? ToPublicImage(MarketingImage? image) =>
        image is null ? null : new PublicMarketingImage(image.Url, image.Label, image.FocalPoint);
}
