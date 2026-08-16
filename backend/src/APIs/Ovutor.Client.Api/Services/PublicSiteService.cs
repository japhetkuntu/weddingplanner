using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Ovutor.Client.Api.Interfaces;
using Ovutor.Client.Api.Models.Requests;
using Ovutor.Client.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Common.Sdk.WebsiteContent;
using Ovutor.Postgres.Sdk.Repositories;
using ClientEntity = Ovutor.Postgres.Sdk.Entities.Client;
using WebsiteContentEntity = Ovutor.Postgres.Sdk.Entities.WebsiteContent;

namespace Ovutor.Client.Api.Services;

public class PublicSiteService(
    IRepository<ClientEntity> clients,
    IRepository<Ovutor.Postgres.Sdk.Entities.WebsiteSection> websiteSections,
    IRepository<WebsiteContentEntity> websiteContents,
    IRepository<Ovutor.Postgres.Sdk.Entities.RsvpGuest> rsvpGuests,
    IRepository<Ovutor.Postgres.Sdk.Entities.ActivityEvent> activityEvents,
    ILogger<PublicSiteService> logger) : IPublicSiteService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<IApiResponse<PublicSiteResponse>> GetSiteAsync(string slug, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.FindAsync(c => c.Slug == slug, ct) ?? throw new NotFoundException("We couldn't find that wedding website.");
            var sections = await websiteSections.GetQueryable().Where(s => s.ClientId == client.Id).ToListAsync(ct);
            var publishedKeys = sections.Where(s => s.Status == "published").Select(s => s.Key).ToList();

            var content = await websiteContents.FindAsync(c => c.ClientId == client.Id, ct)
                ?? throw new NotFoundException("This wedding website hasn't been set up yet.");

            var hero = JsonSerializer.Deserialize<WebsiteHero>(content.HeroJson, JsonOptions)!;
            var ourStory = JsonSerializer.Deserialize<WebsiteOurStory>(content.OurStoryJson, JsonOptions)!;
            var details = JsonSerializer.Deserialize<List<WebsiteDetailCard>>(content.DetailsJson, JsonOptions)!;
            var schedule = JsonSerializer.Deserialize<List<WebsiteScheduleEvent>>(content.ScheduleJson, JsonOptions)!;
            var travel = JsonSerializer.Deserialize<List<WebsiteTravelItem>>(content.TravelJson, JsonOptions)!;
            var gallery = JsonSerializer.Deserialize<List<WebsiteGalleryPhoto>>(content.GalleryJson, JsonOptions)!;
            var rsvp = JsonSerializer.Deserialize<WebsiteRsvpConfig>(content.RsvpJson, JsonOptions)!;

            var response = new PublicSiteResponse(
                client.CoupleNames,
                client.WeddingDate.ToString("yyyy-MM-dd"),
                publishedKeys,
                new PublicHero(hero.Eyebrow, hero.CoupleNames, hero.DateLabel, hero.VenueLabel, new PublicSiteImage(hero.Image.Url, hero.Image.Label, hero.Image.FocalPoint)),
                new PublicOurStory(
                    ourStory.Eyebrow, ourStory.Title, ourStory.Paragraphs,
                    ourStory.Moments.Select(m => new PublicStoryMoment(m.Label, m.Year)).ToList(),
                    ourStory.Images.Select(i => new PublicSiteImage(i.Url, i.Label)).ToList()),
                details.Select(d => new PublicDetailCard(d.Eyebrow, d.Heading, d.Body, d.Note)).ToList(),
                schedule.Select(s => new PublicScheduleEvent(s.Time, s.Title, s.Detail)).ToList(),
                travel.Select(t => new PublicTravelItem(t.Heading, t.Body)).ToList(),
                gallery.Select(g => new PublicGalleryPhoto(g.Url, g.Label, g.Caption)).ToList(),
                new PublicRsvpBlock(
                    "Will you join us?",
                    "We hope to celebrate with you.",
                    BuildRsvpBody(rsvp.Deadline),
                    rsvp.Deadline,
                    rsvp.ConfirmationMessage,
                    rsvp.CollectDietary,
                    rsvp.CollectPlusOne,
                    rsvp.CollectEmail,
                    rsvp.CollectMobile,
                    rsvp.CollectAccommodation,
                    rsvp.CollectTransportation));

            return response.ToOkApiResponse();
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[GetSiteAsync] Failed to load public site for {Slug}", slug);
            return ApiResponseFactory.InternalError<PublicSiteResponse>("Failed to load this wedding website.");
        }
    }

    private static string BuildRsvpBody(string deadline) =>
        DateOnly.TryParse(deadline, out var date)
            ? $"Please reply by {date:MMMM d}. Your response helps us make every place at the table feel considered."
            : "Your response helps us make every place at the table feel considered.";

    public async Task<IApiResponse<object>> SubmitRsvpAsync(string slug, SubmitRsvpRequest request, CancellationToken ct = default)
    {
        try
        {
            var client = await clients.FindAsync(c => c.Slug == slug, ct) ?? throw new NotFoundException("We couldn't find that wedding website.");
            var fullName = request.FullName.Trim();
            if (string.IsNullOrEmpty(fullName)) throw new OvutorException("Please enter your name.", 400);

            var guest = await rsvpGuests.FindAsync(g => g.ClientId == client.Id && g.Household.ToLower() == fullName.ToLower(), ct);
            var status = request.Attending ? "attending" : "declined";

            if (guest is null)
            {
                guest = new Ovutor.Postgres.Sdk.Entities.RsvpGuest
                {
                    ClientId = client.Id,
                    Household = fullName,
                    Status = status,
                    AttendanceCount = request.Attending ? request.AttendanceCount : null,
                    Dietary = request.Attending ? request.Dietary : null,
                    Email = request.Email,
                    Mobile = request.Mobile,
                    NeedsAccommodation = request.Attending ? request.NeedsAccommodation : null,
                    NeedsTransportation = request.Attending ? request.NeedsTransportation : null,
                    RespondedAtUtc = DateTime.UtcNow,
                };
                await rsvpGuests.AddAsync(guest, ct);
            }
            else
            {
                guest.Status = status;
                guest.AttendanceCount = request.Attending ? request.AttendanceCount : null;
                guest.Dietary = request.Attending ? request.Dietary : null;
                if (request.Email is not null) guest.Email = request.Email;
                if (request.Mobile is not null) guest.Mobile = request.Mobile;
                guest.NeedsAccommodation = request.Attending ? request.NeedsAccommodation : null;
                guest.NeedsTransportation = request.Attending ? request.NeedsTransportation : null;
                guest.RespondedAtUtc = DateTime.UtcNow;
                await rsvpGuests.UpdateAsync(guest, ct);
            }

            await activityEvents.AddAsync(new Ovutor.Postgres.Sdk.Entities.ActivityEvent
            {
                ClientId = client.Id,
                Message = $"{fullName} RSVP'd {status} for {client.CoupleNames}.",
                TimestampUtc = DateTime.UtcNow,
            }, ct);

            return ApiResponseFactory.Ok<object>(new { }, "Your response has been received.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[SubmitRsvpAsync] Failed to submit RSVP for {Slug}", slug);
            return ApiResponseFactory.InternalError<object>("Failed to submit your RSVP.");
        }
    }
}
