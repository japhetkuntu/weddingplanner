using Microsoft.AspNetCore.Http;

namespace Ovutor.Admin.Api.Models.Requests;

public record UpdateDocumentRequest(string Name, string Category, string Visibility);

public record CreateDocumentCategoryRequest(string Name);

/// <summary>Bound as a single [FromForm] model rather than separate loose parameters — Swashbuckle
/// can't generate a multipart schema for a bare IFormFile parameter mixed with other [FromForm]
/// primitives, but handles it fine as a property on a bound complex type.</summary>
public class UploadDocumentForm
{
    public required IFormFile File { get; set; }
    public required string Category { get; set; }
    public required string Visibility { get; set; }
}
