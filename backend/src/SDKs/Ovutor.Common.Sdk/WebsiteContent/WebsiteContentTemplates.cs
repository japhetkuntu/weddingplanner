namespace Ovutor.Common.Sdk.WebsiteContent;

/// <summary>Every field pre-filled with a realistic example — shows the admin what "good" looks like
/// and doubles as instructions. Used both to seed the fixture clients and to give every newly created
/// client a starting point instead of a blank site.</summary>
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
        "Together with their families", coupleNames, "Add your wedding date", "Add your venue",
        new WebsiteImage(null, "Upload a hero photo — a wide landscape shot of the couple works best"));

    public static WebsiteOurStory OurStoryTemplate() => new(
        "Our Story", "Replace with your own line, e.g. \"A story worth telling.\"",
        [
            "This is where your story begins — a sentence or two on how you met sets the tone for the whole page.",
            "Add a second paragraph about your journey together, or what led to the proposal.",
        ],
        [new WebsiteStoryMoment("First date", "2019"), new WebsiteStoryMoment("The proposal", "2025")],
        [new WebsiteImage(null, "Add a photo of the two of you"), new WebsiteImage(null, "Add a favorite travel or date photo")]);

    public static List<WebsiteDetailCard> DetailsTemplate() =>
    [
        new WebsiteDetailCard("Ceremony", "4:30 PM", "Venue name\nStreet address, City, State", "Add any arrival guidance for guests, e.g. \"Please arrive by 4:00 PM to be seated.\""),
        new WebsiteDetailCard("Reception", "5:30 PM–11:00 PM", "Reception location, if different from the ceremony", "e.g. \"Cocktails, dinner, and dancing to follow.\""),
        new WebsiteDetailCard("Attire", "e.g. Formal garden party", "", "Any helpful notes on dress code, weather or footwear."),
        new WebsiteDetailCard("Parking & arrival", "e.g. Easy to find", "", "Parking, rideshare drop-off, or accessibility notes."),
    ];

    public static List<WebsiteScheduleEvent> ScheduleTemplate() =>
    [
        new WebsiteScheduleEvent("4:00 PM", "Guest arrival", "Please arrive in time to be seated."),
        new WebsiteScheduleEvent("4:30 PM", "Ceremony", "Add the ceremony location"),
        new WebsiteScheduleEvent("5:30 PM", "Cocktail hour", "Add the location"),
        new WebsiteScheduleEvent("6:30 PM", "Dinner & toasts", "Add the location"),
    ];

    public static List<WebsiteTravelItem> TravelTemplate() =>
    [
        new WebsiteTravelItem("Hotel block", "Add details of a room block or recommended hotel for out-of-town guests."),
        new WebsiteTravelItem("Getting there", "Add directions, parking, or public transport tips."),
    ];

    public static List<WebsiteGalleryPhoto> GalleryTemplate() =>
    [
        new WebsiteGalleryPhoto(null, "Add a favorite photo", "Add a short caption"),
        new WebsiteGalleryPhoto(null, "Add another photo", "Add a short caption"),
    ];

    public static WebsiteRsvpConfig RsvpTemplate() =>
        new("", "We can't wait to celebrate with you. Your response has been received.", true, false);
}
