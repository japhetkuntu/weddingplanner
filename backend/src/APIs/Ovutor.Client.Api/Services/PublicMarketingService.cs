using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Ovutor.Client.Api.Interfaces;
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

    private static PublicMarketingImage? ToPublicImage(MarketingImage? image) =>
        image is null ? null : new PublicMarketingImage(image.Url, image.Label, image.FocalPoint);
}
