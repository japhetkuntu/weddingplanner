namespace Ovutor.Common.Sdk.WebsiteContent;

/// <summary>Shared shape for everything stored in WebsiteContent's JSON columns and returned to both the
/// admin editor and the public site — one definition, serialized/deserialized by both APIs.</summary>
/// <summary>FocalPoint is "top" | "center" | "bottom" — where the hero image should anchor when
/// cropped to fill the section, so a portrait or off-center photo doesn't lose its subject.</summary>
public record WebsiteImage(string? Url, string Label, string FocalPoint = "center");

public record WebsiteHero(string Eyebrow, string CoupleNames, string DateLabel, string VenueLabel, WebsiteImage Image);

public record WebsiteStoryMoment(string Label, string Year);

public record WebsiteOurStory(string Eyebrow, string Title, List<string> Paragraphs, List<WebsiteStoryMoment> Moments, List<WebsiteImage> Images);

public record WebsiteDetailCard(string Eyebrow, string Heading, string Body, string? Note);

public record WebsiteScheduleEvent(string Time, string Title, string Detail);

public record WebsiteTravelItem(string Heading, string Body);

public record WebsiteGalleryPhoto(string? Url, string Label, string Caption);

public record WebsiteRsvpConfig(
    string Deadline,
    string ConfirmationMessage,
    bool CollectDietary,
    bool CollectPlusOne,
    bool CollectEmail,
    bool CollectMobile,
    bool CollectAccommodation,
    bool CollectTransportation);
