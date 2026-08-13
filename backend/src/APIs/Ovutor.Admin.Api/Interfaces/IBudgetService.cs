using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IBudgetService
{
    Task<IApiResponse<BudgetResponse>> GetForClientAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<BudgetCategoryResponse>> AddCategoryAsync(Guid clientId, CreateCategoryRequest request, CancellationToken ct = default);
    Task<IApiResponse<BudgetCategoryResponse>> UpdateCategoryAsync(Guid categoryId, UpdateCategoryRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteCategoryAsync(Guid categoryId, CancellationToken ct = default);
    Task<IApiResponse<BudgetExpenseResponse>> AddExpenseAsync(Guid categoryId, CancellationToken ct = default);
    Task<IApiResponse<BudgetExpenseResponse>> UpdateExpenseAsync(Guid expenseId, UpdateExpenseRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteExpenseAsync(Guid expenseId, CancellationToken ct = default);
}
