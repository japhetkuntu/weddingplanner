using Microsoft.AspNetCore.Http;
using Ovutor.Common.Sdk.MarketingContent;

namespace Ovutor.Admin.Api.Models.Requests;

public record UpdateMarketingHeroRequest(MarketingHero Hero);

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
