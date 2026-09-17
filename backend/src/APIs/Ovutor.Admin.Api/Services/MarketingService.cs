using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.MarketingContent;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;
using Ovutor.Storage.Sdk;

namespace Ovutor.Admin.Api.Services;

public class MarketingService(
    IRepository<MarketingHeroContent> heroes,
    IRepository<MarketingSection> sections,
    IStorageService storageService,
    ILogger<MarketingService> logger) : IMarketingService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private const string ContentBlockType = "content-block";

    public async Task<IApiResponse<MarketingHeroResponse>> GetHeroAsync(string pageSlug, CancellationToken ct = default)
    {
        try
        {
            var hero = await heroes.FindAsync(h => h.PageSlug == pageSlug, ct);
            var content = hero is null ? new MarketingHero(null, null, null, null, null, null) : Deserialize(hero.ContentJson);
            return new MarketingHeroResponse(pageSlug, content).ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetHeroAsync] Failed to load hero for {PageSlug}", pageSlug);
            return ApiResponseFactory.InternalError<MarketingHeroResponse>("Failed to load the hero section.");
        }
    }

    public async Task<IApiResponse<MarketingHeroResponse>> UpdateHeroAsync(string pageSlug, UpdateMarketingHeroRequest request, CancellationToken ct = default)
    {
        try
        {
            var hero = await heroes.FindAsync(h => h.PageSlug == pageSlug, ct);
            var json = JsonSerializer.Serialize(request.Hero, JsonOptions);
            if (hero is null)
            {
                hero = new MarketingHeroContent { PageSlug = pageSlug, ContentJson = json };
                await heroes.AddAsync(hero, ct);
            }
            else
            {
                hero.ContentJson = json;
                await heroes.UpdateAsync(hero, ct);
            }

            return new MarketingHeroResponse(pageSlug, request.Hero).ToOkApiResponse("Saved.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateHeroAsync] Failed to save hero for {PageSlug}", pageSlug);
            return ApiResponseFactory.InternalError<MarketingHeroResponse>("Failed to save the hero section.");
        }
    }

    public async Task<IApiResponse<List<MarketingSectionResponse>>> GetSectionsAsync(string pageSlug, CancellationToken ct = default)
    {
        try
        {
            var list = await sections.GetQueryable()
                .Where(s => s.PageSlug == pageSlug)
                .OrderBy(s => s.Order)
                .ToListAsync(ct);
            return list.Select(ToResponse).ToList().ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetSectionsAsync] Failed to load sections for {PageSlug}", pageSlug);
            return ApiResponseFactory.InternalError<List<MarketingSectionResponse>>("Failed to load sections.");
        }
    }

    public async Task<IApiResponse<MarketingSectionResponse>> CreateSectionAsync(string pageSlug, CreateMarketingSectionRequest request, CancellationToken ct = default)
    {
        try
        {
            var maxOrder = await sections.GetQueryable().Where(s => s.PageSlug == pageSlug).Select(s => (int?)s.Order).MaxAsync(ct) ?? -1;
            var section = new MarketingSection
            {
                PageSlug = pageSlug,
                Type = ContentBlockType,
                Order = maxOrder + 1,
                IsEnabled = true,
                Title = request.Title,
                ContentJson = JsonSerializer.Serialize(request.Content, JsonOptions),
            };
            await sections.AddAsync(section, ct);
            return ToResponse(section).ToCreatedApiResponse("Section added.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[CreateSectionAsync] Failed to create section for {PageSlug}", pageSlug);
            return ApiResponseFactory.InternalError<MarketingSectionResponse>("Failed to add that section.");
        }
    }

    public async Task<IApiResponse<MarketingSectionResponse>> UpdateSectionAsync(Guid sectionId, UpdateMarketingSectionRequest request, CancellationToken ct = default)
    {
        try
        {
            var section = await sections.GetByIdAsync(sectionId, ct) ?? throw new NotFoundException("We couldn't find that section.");
            section.Title = request.Title;
            section.ContentJson = JsonSerializer.Serialize(request.Content, JsonOptions);
            await sections.UpdateAsync(section, ct);
            return ToResponse(section).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateSectionAsync] Failed to save section {SectionId}", sectionId);
            return ApiResponseFactory.InternalError<MarketingSectionResponse>("Failed to save that section.");
        }
    }

    public async Task<IApiResponse<MarketingSectionResponse>> SetSectionEnabledAsync(Guid sectionId, SetMarketingSectionEnabledRequest request, CancellationToken ct = default)
    {
        try
        {
            var section = await sections.GetByIdAsync(sectionId, ct) ?? throw new NotFoundException("We couldn't find that section.");
            section.IsEnabled = request.IsEnabled;
            await sections.UpdateAsync(section, ct);
            return ToResponse(section).ToOkApiResponse(request.IsEnabled ? "Section enabled." : "Section disabled.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[SetSectionEnabledAsync] Failed to update section {SectionId}", sectionId);
            return ApiResponseFactory.InternalError<MarketingSectionResponse>("Failed to update that section.");
        }
    }

    public async Task<IApiResponse<List<MarketingSectionResponse>>> ReorderSectionsAsync(string pageSlug, ReorderMarketingSectionsRequest request, CancellationToken ct = default)
    {
        try
        {
            var list = await sections.GetQueryable().Where(s => s.PageSlug == pageSlug).ToListAsync(ct);
            for (var i = 0; i < request.OrderedIds.Count; i++)
            {
                var section = list.FirstOrDefault(s => s.Id == request.OrderedIds[i]);
                if (section is null) continue;
                section.Order = i;
                await sections.UpdateAsync(section, ct);
            }

            var ordered = list.OrderBy(s => s.Order).Select(ToResponse).ToList();
            return ordered.ToOkApiResponse("Order saved.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[ReorderSectionsAsync] Failed to reorder sections for {PageSlug}", pageSlug);
            return ApiResponseFactory.InternalError<List<MarketingSectionResponse>>("Failed to save the new order.");
        }
    }

    public async Task<IApiResponse<object>> DeleteSectionAsync(Guid sectionId, CancellationToken ct = default)
    {
        try
        {
            var section = await sections.GetByIdAsync(sectionId, ct) ?? throw new NotFoundException("We couldn't find that section.");
            await sections.RemoveAsync(section, ct);
            return new object().ToOkApiResponse("Section deleted.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[DeleteSectionAsync] Failed to delete section {SectionId}", sectionId);
            return ApiResponseFactory.InternalError<object>("Failed to delete that section.");
        }
    }

    public async Task<IApiResponse<MarketingImageUploadResponse>> UploadImageAsync(string pageSlug, IFormFile file, CancellationToken ct = default)
    {
        try
        {
            if (file.Length == 0) throw new OvutorException("The selected file is empty.", 400);

            var key = await storageService.UploadAsync(new UploadFileRequest
            {
                OpenContent = file.OpenReadStream,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                Folder = $"marketing/{pageSlug}",
                OptimizeAsPhoto = true,
            }, ct);

            return new MarketingImageUploadResponse(storageService.BuildPublicUrl(key)).ToCreatedApiResponse("Image uploaded.");
        }
        catch (OvutorException) { throw; }
        catch (StorageException e)
        {
            logger.LogError(e, "[UploadImageAsync] Storage rejected upload for {PageSlug}", pageSlug);
            return ApiResponseFactory.InternalError<MarketingImageUploadResponse>("Failed to upload image.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[UploadImageAsync] Failed to upload image for {PageSlug}", pageSlug);
            return ApiResponseFactory.InternalError<MarketingImageUploadResponse>("Failed to upload image.");
        }
    }

    private static MarketingHero Deserialize(string json) => JsonSerializer.Deserialize<MarketingHero>(json, JsonOptions)!;

    private static MarketingSectionResponse ToResponse(MarketingSection s) => new(
        s.Id,
        s.PageSlug,
        s.Type,
        s.Order,
        s.IsEnabled,
        s.Title,
        JsonSerializer.Deserialize<MarketingContentBlock>(s.ContentJson, JsonOptions)!);
}
