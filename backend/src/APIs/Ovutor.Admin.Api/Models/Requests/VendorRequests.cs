using Microsoft.AspNetCore.Http;

namespace Ovutor.Admin.Api.Models.Requests;

public record CreateVendorRequest(string Name, string? Contact, string Location, string? Category, string? Summary);

public record UpdateVendorRequest(string Name, string? Contact, string Location, string? Category, string? Summary);

/// <summary>Bound as a single [FromForm] model — Swashbuckle can't generate a multipart schema for a
/// bare IFormFile parameter, but handles it fine as a property on a bound complex type.</summary>
public class UploadVendorFileForm
{
    public required IFormFile File { get; set; }
}
