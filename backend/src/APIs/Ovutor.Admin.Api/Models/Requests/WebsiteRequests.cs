using Microsoft.AspNetCore.Http;
using Ovutor.Common.Sdk.WebsiteContent;

namespace Ovutor.Admin.Api.Models.Requests;

public record UpdateSectionStatusRequest(string Status);

/// <summary>Bound as a single [FromForm] model — see UploadDocumentForm for why Swashbuckle needs this
/// instead of a bare IFormFile parameter.</summary>
public class UploadWebsiteImageForm
{
    public required IFormFile File { get; set; }
}

public record UpdateWebsiteContentRequest(
    WebsiteHero Hero,
    WebsiteOurStory OurStory,
    List<WebsiteDetailCard> Details,
    List<WebsiteScheduleEvent> Schedule,
    List<WebsiteTravelItem> Travel,
    List<WebsiteGalleryPhoto> Gallery,
    WebsiteRsvpConfig Rsvp);
