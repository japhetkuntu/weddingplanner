namespace Ovutor.Admin.Api.Models.Responses;

public record BudgetCategoryResponse(Guid Id, Guid ClientId, string Name, string? Description);

public record BudgetExpenseResponse(
    Guid Id,
    Guid CategoryId,
    string Vendor,
    Guid? VendorId,
    string? Description,
    decimal Estimated,
    decimal Actual,
    decimal Paid,
    string? NextDue);

public record BudgetResponse(List<BudgetCategoryResponse> Categories, List<BudgetExpenseResponse> Expenses);
