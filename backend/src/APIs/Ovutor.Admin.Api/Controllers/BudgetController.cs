using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;

namespace Ovutor.Admin.Api.Controllers;

[ApiController]
[Authorize]
public class BudgetController(IBudgetService budgetService) : ControllerBase
{
    [HttpGet("api/clients/{clientId:guid}/budget")]
    public async Task<IActionResult> GetForClient(Guid clientId, CancellationToken ct)
    {
        var response = await budgetService.GetForClientAsync(clientId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/clients/{clientId:guid}/budget/categories")]
    public async Task<IActionResult> AddCategory(Guid clientId, CreateCategoryRequest request, CancellationToken ct)
    {
        var response = await budgetService.AddCategoryAsync(clientId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/budget/categories/{categoryId:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid categoryId, UpdateCategoryRequest request, CancellationToken ct)
    {
        var response = await budgetService.UpdateCategoryAsync(categoryId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("api/budget/categories/{categoryId:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid categoryId, CancellationToken ct)
    {
        var response = await budgetService.DeleteCategoryAsync(categoryId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPost("api/budget/categories/{categoryId:guid}/expenses")]
    public async Task<IActionResult> AddExpense(Guid categoryId, CancellationToken ct)
    {
        var response = await budgetService.AddExpenseAsync(categoryId, ct);
        return StatusCode(response.Code, response);
    }

    [HttpPut("api/budget/expenses/{expenseId:guid}")]
    public async Task<IActionResult> UpdateExpense(Guid expenseId, UpdateExpenseRequest request, CancellationToken ct)
    {
        var response = await budgetService.UpdateExpenseAsync(expenseId, request, ct);
        return StatusCode(response.Code, response);
    }

    [HttpDelete("api/budget/expenses/{expenseId:guid}")]
    public async Task<IActionResult> DeleteExpense(Guid expenseId, CancellationToken ct)
    {
        var response = await budgetService.DeleteExpenseAsync(expenseId, ct);
        return StatusCode(response.Code, response);
    }
}
