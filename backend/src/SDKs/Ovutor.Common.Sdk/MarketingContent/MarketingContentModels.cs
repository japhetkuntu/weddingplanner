namespace Ovutor.Common.Sdk.MarketingContent;

/// <summary>Shared shape for everything stored in Marketing*'s JSON columns and returned to both the
/// admin editor and the public marketing site — one definition, serialized/deserialized by both APIs.
/// Every field is nullable/optional: null means "the admin hasn't set this", which the public site
/// (apps/wedding-website) resolves per field against its own static content, not something either
/// API decides on the site's behalf.</summary>
public record MarketingImage(string? Url, string? Label, string? FocalPoint);

public record MarketingHero(string? Eyebrow, string? Title, string? Subtitle, string? CtaLabel, string? CtaTo, List<MarketingImage>? Media);

/// <summary>Layout is "text-only" | "image-left" | "image-right" | "image-full".</summary>
public record MarketingContentBlock(string? Heading, string? Body, MarketingImage? Image, string Layout);
