using System.Text.Json;

namespace Ovutor.Client.Api.Models.Responses;

public record PublicMarketingImage(string? Url, string? Label, string? FocalPoint);

public record PublicMarketingSection(Guid Id, string Type, string? Heading, string? Body, PublicMarketingImage? Image, string Layout);

/// <summary>Every named fixed-content block saved for this page (keyed by the same "hero" |
/// "statement" | "categories" | ... names the admin editor uses), plus the admin-added extra
/// sections (unchanged — see PublicMarketingSection). Fixed-content values are passed through as
/// raw JSON — the backend doesn't know a "hero" from a "categories" block, only apps/wedding-website's
/// per-page merge logic does. A page nobody has edited yet just returns an empty `Content`
/// dictionary — that's a normal state, not an error.</summary>
public record PublicMarketingPageResponse(Dictionary<string, JsonElement> Content, List<PublicMarketingSection> Sections);
