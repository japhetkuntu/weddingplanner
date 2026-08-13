namespace Ovutor.Admin.Api.Models.Requests;

public record CreateCategoryRequest(string Name);

public record UpdateCategoryRequest(string Name, string? Description);

public record UpdateExpenseRequest(string Vendor, string? Description, decimal Planned, decimal Agreed, decimal Paid, string? NextDue);
