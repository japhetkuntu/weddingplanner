using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Ovutor.Common.Sdk.MarketingContent;

namespace Ovutor.Admin.Api.Models.Requests;

/// <summary>Content is opaque to the backend — whatever JSON the admin editor sends for a given
/// (pageSlug, key) is stored and returned verbatim; only the frontend on each side knows what a
/// "hero" or a "categories" block actually contains.</summary>
public record UpdateMarketingFixedContentRequest(JsonElement Content);

public record CreateMarketingSectionRequest(string Title, MarketingContentBlock Content);

public record UpdateMarketingSectionRequest(string Title, MarketingContentBlock Content);

public record SetMarketingSectionEnabledRequest(bool IsEnabled);

public record ReorderMarketingSectionsRequest(List<Guid> OrderedIds);

/// <summary>Bound as a single [FromForm] model — see UploadWebsiteImageForm for why Swashbuckle needs
/// this instead of a bare IFormFile parameter.</summary>
public class UploadMarketingImageForm
{
    public required IFormFile File { get; set; }
}
