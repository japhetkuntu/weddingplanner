namespace Ovutor.Postgres.Sdk.Entities;

/// <summary>One row per page's fixed hero — a singleton per <see cref="PageSlug"/>, created the first
/// time an admin saves anything for that page's hero (no seed data, no row for a page nobody has
/// touched yet). Stored as one JSON blob rather than named columns per field so every hero field can
/// independently be "not set" (null) — the public site falls back to its own static copy per field,
/// so distinguishing "not set" from "set to empty" matters here in a way it didn't for the couple-site
/// pattern this is modeled on (which always seeds real rows at client-creation time).</summary>
public class MarketingHeroContent : BaseEntity
{
    /// <summary>"home" for the pilot; other page slugs can reuse this same table later.</summary>
    public required string PageSlug { get; set; }

    public required string ContentJson { get; set; }
}

/// <summary>Admin-added/removed generic content sections appended after a page's hero. Unlike
/// <see cref="WebsiteSection"/>'s closed set of section keys, <see cref="Type"/> plus a free-form
/// <see cref="ContentJson"/> blob is what lets the admin add or remove whole sections rather than
/// just editing fixed ones — the one deliberate architectural departure from the couple-site pattern.</summary>
public class MarketingSection : BaseEntity
{
    public required string PageSlug { get; set; }

    /// <summary>Only "content-block" exists for the pilot; extensible for future section kinds.</summary>
    public required string Type { get; set; }

    public int Order { get; set; }
    public bool IsEnabled { get; set; } = true;

    /// <summary>Admin-facing label shown in the section list — not rendered on the public site.</summary>
    public required string Title { get; set; }

    public required string ContentJson { get; set; }
}
