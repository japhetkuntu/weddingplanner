namespace Ovutor.Client.Api.Models.Responses;

public record PublicMarketingImage(string? Url, string? Label, string? FocalPoint);

public record PublicMarketingHero(string? Eyebrow, string? Title, string? Subtitle, string? CtaLabel, string? CtaTo, List<PublicMarketingImage>? Media);

public record PublicMarketingSection(Guid Id, string Type, string? Heading, string? Body, PublicMarketingImage? Image, string Layout);

public record PublicMarketingPageResponse(PublicMarketingHero? Hero, List<PublicMarketingSection> Sections);
