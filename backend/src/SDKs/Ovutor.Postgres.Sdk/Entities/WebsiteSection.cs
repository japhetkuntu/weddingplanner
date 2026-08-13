namespace Ovutor.Postgres.Sdk.Entities;

public class WebsiteSection : BaseEntity
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }

    /// <summary>"hero" | "our-story" | "details" | "schedule" | "travel" | "gallery" | "rsvp"</summary>
    public required string Key { get; set; }

    public int Order { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }

    /// <summary>"draft" | "published" | "hidden"</summary>
    public required string Status { get; set; }
}

/// <summary>One row per client. Each nested section is stored as a JSON string column (Postgres jsonb) —
/// these are admin-authored, non-relational blobs with no independent query needs, so this avoids ~10
/// extra join tables. Serialized/deserialized in the service layer, never touched raw by callers.</summary>
public class WebsiteContent : BaseEntity
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }

    public required string HeroJson { get; set; }
    public required string OurStoryJson { get; set; }
    public required string DetailsJson { get; set; }
    public required string ScheduleJson { get; set; }
    public required string TravelJson { get; set; }
    public required string GalleryJson { get; set; }
    public required string RsvpJson { get; set; }
}
