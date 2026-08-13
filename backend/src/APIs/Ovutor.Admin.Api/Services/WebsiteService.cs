using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Common.Sdk.WebsiteContent;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;
using Ovutor.Storage.Sdk;

namespace Ovutor.Admin.Api.Services;

public class WebsiteService(
    IRepository<WebsiteSection> sections,
    IRepository<WebsiteContent> contents,
    IStorageService storageService,
    ILogger<WebsiteService> logger) : IWebsiteService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly string[] AllowedStatuses = ["draft", "published", "hidden"];

    public async Task<IApiResponse<List<WebsiteSectionResponse>>> GetSectionsAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var list = await sections.GetQueryable()
                .Where(s => s.ClientId == clientId)
                .OrderBy(s => s.Order)
                .ToListAsync(ct);
            return list.Select(ToResponse).ToList().ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetSectionsAsync] Failed to load website sections for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<List<WebsiteSectionResponse>>("Failed to load website sections.");
        }
    }

    public async Task<IApiResponse<WebsiteSectionResponse>> UpdateSectionStatusAsync(Guid sectionId, UpdateSectionStatusRequest request, CancellationToken ct = default)
    {
        try
        {
            if (!AllowedStatuses.Contains(request.Status))
                throw new OvutorException("Status must be draft, published or hidden.", 400);

            var section = await sections.GetByIdAsync(sectionId, ct) ?? throw new NotFoundException("We couldn't find that section.");
            section.Status = request.Status;
            await sections.UpdateAsync(section, ct);
            return ToResponse(section).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateSectionStatusAsync] Failed to update section {SectionId}", sectionId);
            return ApiResponseFactory.InternalError<WebsiteSectionResponse>("Failed to save section.");
        }
    }

    public async Task<IApiResponse<WebsiteContentResponse>> GetContentAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var content = await contents.FindAsync(c => c.ClientId == clientId, ct)
                ?? throw new NotFoundException("We couldn't find that client's website content.");
            return ToResponse(content).ToOkApiResponse();
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[GetContentAsync] Failed to load website content for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<WebsiteContentResponse>("Failed to load website content.");
        }
    }

    public async Task<IApiResponse<WebsiteContentResponse>> UpdateContentAsync(Guid clientId, UpdateWebsiteContentRequest request, CancellationToken ct = default)
    {
        try
        {
            var content = await contents.FindAsync(c => c.ClientId == clientId, ct)
                ?? throw new NotFoundException("We couldn't find that client's website content.");

            content.HeroJson = JsonSerializer.Serialize(request.Hero, JsonOptions);
            content.OurStoryJson = JsonSerializer.Serialize(request.OurStory, JsonOptions);
            content.DetailsJson = JsonSerializer.Serialize(request.Details, JsonOptions);
            content.ScheduleJson = JsonSerializer.Serialize(request.Schedule, JsonOptions);
            content.TravelJson = JsonSerializer.Serialize(request.Travel, JsonOptions);
            content.GalleryJson = JsonSerializer.Serialize(request.Gallery, JsonOptions);
            content.RsvpJson = JsonSerializer.Serialize(request.Rsvp, JsonOptions);
            await contents.UpdateAsync(content, ct);

            return ToResponse(content).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateContentAsync] Failed to save website content for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<WebsiteContentResponse>("Failed to save website content.");
        }
    }

    public async Task<IApiResponse<WebsiteImageUploadResponse>> UploadImageAsync(Guid clientId, IFormFile file, CancellationToken ct = default)
    {
        try
        {
            if (file.Length == 0) throw new OvutorException("The selected file is empty.", 400);

            var key = await storageService.UploadAsync(new UploadFileRequest
            {
                OpenContent = file.OpenReadStream,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                Folder = $"website/{clientId}",
            }, ct);

            return new WebsiteImageUploadResponse(storageService.BuildPublicUrl(key)).ToCreatedApiResponse("Image uploaded.");
        }
        catch (OvutorException) { throw; }
        catch (StorageException e)
        {
            logger.LogError(e, "[UploadImageAsync] Storage rejected upload for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<WebsiteImageUploadResponse>("Failed to upload image.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[UploadImageAsync] Failed to upload image for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<WebsiteImageUploadResponse>("Failed to upload image.");
        }
    }

    private static WebsiteSectionResponse ToResponse(WebsiteSection s) => new(s.Id, s.Key, s.Order, s.Title, s.Description, s.Status);

    private static WebsiteContentResponse ToResponse(WebsiteContent c) => new(
        c.ClientId,
        JsonSerializer.Deserialize<WebsiteHero>(c.HeroJson, JsonOptions)!,
        JsonSerializer.Deserialize<WebsiteOurStory>(c.OurStoryJson, JsonOptions)!,
        JsonSerializer.Deserialize<List<WebsiteDetailCard>>(c.DetailsJson, JsonOptions)!,
        JsonSerializer.Deserialize<List<WebsiteScheduleEvent>>(c.ScheduleJson, JsonOptions)!,
        JsonSerializer.Deserialize<List<WebsiteTravelItem>>(c.TravelJson, JsonOptions)!,
        JsonSerializer.Deserialize<List<WebsiteGalleryPhoto>>(c.GalleryJson, JsonOptions)!,
        JsonSerializer.Deserialize<WebsiteRsvpConfig>(c.RsvpJson, JsonOptions)!);
}
