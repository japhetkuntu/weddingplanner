namespace Ovutor.Client.Api.Models.Responses;

public record PublicSiteImage(string? Src, string Label);

public record PublicHero(string Eyebrow, string CoupleNames, string Date, string Venue, PublicSiteImage Image);

public record PublicStoryMoment(string Label, string Year);

public record PublicOurStory(string Eyebrow, string Title, List<string> Paragraphs, List<PublicStoryMoment> Moments, List<PublicSiteImage> Images);

public record PublicDetailCard(string Eyebrow, string Heading, string Body, string? Note);

public record PublicScheduleEvent(string Time, string Title, string Detail);

public record PublicTravelItem(string Heading, string Body);

public record PublicGalleryPhoto(string? Src, string Label, string Caption);

public record PublicRsvpBlock(string Eyebrow, string Title, string Body, string Deadline, string ConfirmationMessage, bool CollectDietary, bool CollectPlusOne);

/// <summary>Full parsed content plus which section keys the admin has published — the wedding-website
/// frontend only renders a section if its key appears in <see cref="PublishedSections"/>.</summary>
public record PublicSiteResponse(
    string CoupleNames,
    string Date,
    List<string> PublishedSections,
    PublicHero Hero,
    PublicOurStory OurStory,
    List<PublicDetailCard> Details,
    List<PublicScheduleEvent> Schedule,
    List<PublicTravelItem> Travel,
    List<PublicGalleryPhoto> Gallery,
    PublicRsvpBlock Rsvp);
