using System.Text.Json;
using Ovutor.Common.Sdk.MarketingContent;

namespace Ovutor.Admin.Api.Models.Responses;

public record MarketingFixedContentResponse(string PageSlug, string Key, JsonElement? Content);

public record MarketingSectionResponse(Guid Id, string PageSlug, string Type, int Order, bool IsEnabled, string Title, MarketingContentBlock Content);

public record MarketingImageUploadResponse(string Url);
