using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class BudgetService(
    IRepository<BudgetCategory> categories,
    IRepository<BudgetExpense> expenses,
    IRepository<Client> clients,
    ILogger<BudgetService> logger) : IBudgetService
{
    /// <summary>Client.BudgetPaid is a denormalized rollup so the dashboard/overview pages don't
    /// have to join every expense on every load — kept in sync here whenever an expense or its
    /// owning category changes.</summary>
    private async Task RecalculateClientBudgetPaidAsync(Guid clientId, CancellationToken ct)
    {
        var client = await clients.GetByIdAsync(clientId, ct);
        if (client is null) return;

        var categoryIds = await categories.GetQueryable().Where(c => c.ClientId == clientId).Select(c => c.Id).ToListAsync(ct);
        var totalPaid = await expenses.GetQueryable().Where(e => categoryIds.Contains(e.CategoryId)).SumAsync(e => e.Paid, ct);

        client.BudgetPaid = totalPaid;
        await clients.UpdateAsync(client, ct);
    }

    private async Task<Guid> GetClientIdForCategoryAsync(Guid categoryId, CancellationToken ct)
    {
        var category = await categories.GetByIdAsync(categoryId, ct);
        return category?.ClientId ?? Guid.Empty;
    }

    private async Task<Guid> GetClientIdForExpenseAsync(Guid expenseId, CancellationToken ct)
    {
        var expense = await expenses.GetByIdAsync(expenseId, ct);
        if (expense is null) return Guid.Empty;
        return await GetClientIdForCategoryAsync(expense.CategoryId, ct);
    }

    public async Task<IApiResponse<BudgetResponse>> GetForClientAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var categoryList = await categories.GetQueryable().Where(c => c.ClientId == clientId).ToListAsync(ct);
            var categoryIds = categoryList.Select(c => c.Id).ToList();
            var expenseList = await expenses.GetQueryable().Where(e => categoryIds.Contains(e.CategoryId)).ToListAsync(ct);
            var response = new BudgetResponse(categoryList.Select(ToResponse).ToList(), expenseList.Select(ToResponse).ToList());
            return response.ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetForClientAsync] Failed to load budget for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<BudgetResponse>("Failed to load budget.");
        }
    }

    public async Task<IApiResponse<BudgetCategoryResponse>> AddCategoryAsync(Guid clientId, CreateCategoryRequest request, CancellationToken ct = default)
    {
        try
        {
            var name = request.Name.Trim();
            if (string.IsNullOrEmpty(name)) return ApiResponseFactory.BadRequest<BudgetCategoryResponse>("Give this category a name.");

            var category = new BudgetCategory { ClientId = clientId, Name = name };
            await categories.AddAsync(category, ct);
            return ToResponse(category).ToCreatedApiResponse("Category added.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[AddCategoryAsync] Failed to add category for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<BudgetCategoryResponse>("Failed to add category.");
        }
    }

    public async Task<IApiResponse<BudgetCategoryResponse>> UpdateCategoryAsync(Guid categoryId, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        try
        {
            var category = await categories.GetByIdAsync(categoryId, ct) ?? throw new NotFoundException("We couldn't find that category.");
            category.Name = string.IsNullOrWhiteSpace(request.Name) ? category.Name : request.Name.Trim();
            category.Description = request.Description;
            await categories.UpdateAsync(category, ct);
            return ToResponse(category).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateCategoryAsync] Failed to update category {CategoryId}", categoryId);
            return ApiResponseFactory.InternalError<BudgetCategoryResponse>("Failed to save category.");
        }
    }

    public async Task<IApiResponse<object>> DeleteCategoryAsync(Guid categoryId, CancellationToken ct = default)
    {
        try
        {
            var category = await categories.GetByIdAsync(categoryId, ct) ?? throw new NotFoundException("We couldn't find that category.");
            var categoryExpenses = await expenses.FindManyAsync(e => e.CategoryId == categoryId, ct);
            foreach (var expense in categoryExpenses) await expenses.RemoveAsync(expense, ct);
            await categories.RemoveAsync(category, ct);
            await RecalculateClientBudgetPaidAsync(category.ClientId, ct);
            return new object().ToOkApiResponse("Category deleted.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[DeleteCategoryAsync] Failed to delete category {CategoryId}", categoryId);
            return ApiResponseFactory.InternalError<object>("Failed to delete category.");
        }
    }

    public async Task<IApiResponse<BudgetExpenseResponse>> AddExpenseAsync(Guid categoryId, CancellationToken ct = default)
    {
        try
        {
            _ = await categories.GetByIdAsync(categoryId, ct) ?? throw new NotFoundException("We couldn't find that category.");
            var expense = new BudgetExpense { CategoryId = categoryId, Vendor = "New expense", Planned = 0, Agreed = 0, Paid = 0 };
            await expenses.AddAsync(expense, ct);
            return ToResponse(expense).ToCreatedApiResponse("Expense added.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[AddExpenseAsync] Failed to add expense to category {CategoryId}", categoryId);
            return ApiResponseFactory.InternalError<BudgetExpenseResponse>("Failed to add expense.");
        }
    }

    public async Task<IApiResponse<BudgetExpenseResponse>> UpdateExpenseAsync(Guid expenseId, UpdateExpenseRequest request, CancellationToken ct = default)
    {
        try
        {
            var expense = await expenses.GetByIdAsync(expenseId, ct) ?? throw new NotFoundException("We couldn't find that expense.");
            expense.Vendor = string.IsNullOrWhiteSpace(request.Vendor) ? expense.Vendor : request.Vendor.Trim();
            expense.Description = request.Description;
            expense.Planned = request.Planned;
            expense.Agreed = request.Agreed;
            expense.Paid = request.Paid;
            expense.NextDue = string.IsNullOrWhiteSpace(request.NextDue) ? null : DateOnly.Parse(request.NextDue);
            await expenses.UpdateAsync(expense, ct);
            await RecalculateClientBudgetPaidAsync(await GetClientIdForCategoryAsync(expense.CategoryId, ct), ct);
            return ToResponse(expense).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateExpenseAsync] Failed to update expense {ExpenseId}", expenseId);
            return ApiResponseFactory.InternalError<BudgetExpenseResponse>("Failed to save expense.");
        }
    }

    public async Task<IApiResponse<object>> DeleteExpenseAsync(Guid expenseId, CancellationToken ct = default)
    {
        try
        {
            var expense = await expenses.GetByIdAsync(expenseId, ct) ?? throw new NotFoundException("We couldn't find that expense.");
            var clientId = await GetClientIdForCategoryAsync(expense.CategoryId, ct);
            await expenses.RemoveAsync(expense, ct);
            await RecalculateClientBudgetPaidAsync(clientId, ct);
            return new object().ToOkApiResponse("Expense deleted.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[DeleteExpenseAsync] Failed to delete expense {ExpenseId}", expenseId);
            return ApiResponseFactory.InternalError<object>("Failed to delete expense.");
        }
    }

    private static BudgetCategoryResponse ToResponse(BudgetCategory c) => new(c.Id, c.ClientId, c.Name, c.Description);

    private static BudgetExpenseResponse ToResponse(BudgetExpense e) => new(
        e.Id, e.CategoryId, e.Vendor, e.Description, e.Planned, e.Agreed, e.Paid, e.NextDue?.ToString("yyyy-MM-dd"));
}
