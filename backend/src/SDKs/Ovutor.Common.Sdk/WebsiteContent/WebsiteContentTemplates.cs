namespace Ovutor.Common.Sdk.WebsiteContent;

/// <summary>Starting point for a newly created client's website content. Every field the admin still
/// needs to fill in is left genuinely empty — every field here is rendered verbatim on the couple's
/// live public site (see wedding-website/src/App.tsx), so seeding it with instructional filler text
/// like "Add your venue" risks that literally shipping to guests if a section gets published before
/// it's edited. The admin-portal editor's inputs show the same guidance as HTML placeholders instead
/// (see ClientWebsitePage.tsx), which can never be accidentally submitted as real content. Only fields
/// with genuinely reasonable, ready-to-publish defaults (generic copy, sensible toggles) are seeded
/// with real values here.</summary>
public static class WebsiteContentTemplates {
    public static readonly (string Key, string Title, string Description)[] SectionTemplate =
    [
        ("hero", "Hero", "Couple names, date, venue and hero photo."),
        ("our-story", "Our Story", "How you met, proposal story, photos."),
        ("details", "Details", "Ceremony, reception, attire and parking cards."),
        ("schedule", "Schedule", "The full run of show for the day."),
        ("travel", "Travel & Stay", "Hotel blocks, transport and local tips."),
        ("gallery", "Guest Photo Sharing", "Gallery guests can browse and contribute to."),
        ("rsvp", "RSVP", "Deadline, plus-one and dietary options."),
    ];

    public static WebsiteHero HeroTemplate(string coupleNames) => new(
        "Together with their families", coupleNames, "", "", new WebsiteImage(null, "Upload a hero photo — a wide landscape shot of the couple works best"));

    public static WebsiteOurStory OurStoryTemplate() => new("Our Story", "", [], [], []);

    public static List<WebsiteDetailCard> DetailsTemplate() =>
    [
        new WebsiteDetailCard("Ceremony", "", "", ""),
        new WebsiteDetailCard("Reception", "", "", ""),
        new WebsiteDetailCard("Attire", "", "", ""),
        new WebsiteDetailCard("Parking & arrival", "", "", ""),
    ];

    public static List<WebsiteScheduleEvent> ScheduleTemplate() => [];

    public static List<WebsiteTravelItem> TravelTemplate() => [];

    public static List<WebsiteGalleryPhoto> GalleryTemplate() => [];

    public static WebsiteRsvpConfig RsvpTemplate() =>
        new("", "We can't wait to celebrate with you. Your response has been received.", true, false, false, false, false, false);
}
