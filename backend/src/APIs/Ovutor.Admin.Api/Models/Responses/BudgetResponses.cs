namespace Ovutor.Admin.Api.Models.Responses;

public record BudgetCategoryResponse(Guid Id, Guid ClientId, string Name, string? Description);

public record BudgetExpenseResponse(
    Guid Id,
    Guid CategoryId,
    string Vendor,
    string? Description,
    decimal Planned,
    decimal Agreed,
    decimal Paid,
    string? NextDue);

public record BudgetResponse(List<BudgetCategoryResponse> Categories, List<BudgetExpenseResponse> Expenses);
