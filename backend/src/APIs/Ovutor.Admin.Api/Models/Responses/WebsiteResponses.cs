using Ovutor.Common.Sdk.WebsiteContent;

namespace Ovutor.Admin.Api.Models.Responses;

public record WebsiteSectionResponse(Guid Id, string Key, int Order, string Title, string Description, string Status);

public record WebsiteContentResponse(
    Guid ClientId,
    WebsiteHero Hero,
    WebsiteOurStory OurStory,
    List<WebsiteDetailCard> Details,
    List<WebsiteScheduleEvent> Schedule,
    List<WebsiteTravelItem> Travel,
    List<WebsiteGalleryPhoto> Gallery,
    WebsiteRsvpConfig Rsvp);

public record WebsiteImageUploadResponse(string Url);
