namespace Ovutor.Admin.Api.Models.Requests;

public record CreateVendorRequest(string Name, string? Contact, string Location);

public record UpdateVendorRequest(string Name, string? Contact, string Location);
