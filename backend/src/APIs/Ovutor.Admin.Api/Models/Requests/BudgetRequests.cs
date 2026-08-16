namespace Ovutor.Admin.Api.Models.Requests;

public record CreateCategoryRequest(string Name);

public record UpdateCategoryRequest(string Name, string? Description);

public record UpdateExpenseRequest(string Vendor, Guid? VendorId, string? Description, decimal Estimated, decimal Actual, decimal Paid, string? NextDue);
