namespace Ovutor.Admin.Api.Models.Responses;

public record DocumentFileResponse(
    Guid Id,
    Guid ClientId,
    string Name,
    string Uploader,
    string Visibility,
    string Category,
    string SizeLabel,
    string UploadedAt,
    string? Url,
    string? ContentType);
