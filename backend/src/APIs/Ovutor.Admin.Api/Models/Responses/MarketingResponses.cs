using Ovutor.Common.Sdk.MarketingContent;

namespace Ovutor.Admin.Api.Models.Responses;

public record MarketingHeroResponse(string PageSlug, MarketingHero Hero);

public record MarketingSectionResponse(Guid Id, string PageSlug, string Type, int Order, bool IsEnabled, string Title, MarketingContentBlock Content);

public record MarketingImageUploadResponse(string Url);
