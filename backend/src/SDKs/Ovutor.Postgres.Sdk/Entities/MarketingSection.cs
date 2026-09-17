namespace Ovutor.Postgres.Sdk.Entities;

/// <summary>One row per named fixed content block on a page — e.g. (PageSlug: "home", Key: "hero"),
/// (PageSlug: "our-approach", Key: "steps"). A singleton per (PageSlug, Key), created the first time
/// an admin saves anything for that block (no seed data, no row for a block nobody has touched yet).
/// Stored as one JSON blob rather than named columns per field so every field within it can
/// independently be "not set" (null/absent) — the public site falls back to its own static copy per
/// field, so distinguishing "not set" from "set to empty" matters here in a way it didn't for the
/// couple-site pattern this is modeled on (which always seeds real rows at client-creation time).
/// The backend never inspects <see cref="ContentJson"/>'s shape — it's opaque here, passed through
/// verbatim to and from the admin and public APIs; only the frontend on each side knows what a
/// "hero" or a "categories" block actually contains.</summary>
public class MarketingFixedContent : BaseEntity
{
    public required string PageSlug { get; set; }

    /// <summary>"hero" | "statement" | "flow" | "intro" | "divider" | "heading" | "categories" |
    /// "steps" | "posts" | "paragraphs" — open-ended, one entry per named block a page defines.</summary>
    public required string Key { get; set; }

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
