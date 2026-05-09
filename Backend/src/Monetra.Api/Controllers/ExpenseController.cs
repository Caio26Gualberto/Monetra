using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetra.Api.Common;
using Monetra.Application.DTOs.Expense;
using Monetra.Application.Services;

namespace Monetra.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/financial/expense")]
public class ExpenseController : ControllerBase
{
    private readonly IFinancialService _svc;
    public ExpenseController(IFinancialService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _svc.GetExpensesAsync(User.GetUserId(), ct));

    [HttpGet("month/{month}")]
    public async Task<IActionResult> GetByMonth(string month, CancellationToken ct)
        => Ok(await _svc.GetExpensesByMonthAsync(User.GetUserId(), month, ct));

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetByCategory(string category, CancellationToken ct)
        => Ok(await _svc.GetExpensesByCategoryAsync(User.GetUserId(), category, ct));

    [HttpGet("method/{method}")]
    public async Task<IActionResult> GetByMethod(string method, CancellationToken ct)
        => Ok(await _svc.GetExpensesByMethodAsync(User.GetUserId(), method, ct));

    [HttpGet("summary/{month}")]
    public async Task<IActionResult> Summary(string month, CancellationToken ct)
        => Ok(await _svc.GetExpenseSummaryAsync(User.GetUserId(), month, ct));

    [HttpGet("by-category/{month}")]
    public async Task<IActionResult> ByCategory(string month, CancellationToken ct)
        => Ok(await _svc.GetExpensesByCategoryBreakdownAsync(User.GetUserId(), month, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateExpenseDto dto, CancellationToken ct)
        => Ok(await _svc.CreateExpenseAsync(User.GetUserId(), dto, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateExpenseDto dto, CancellationToken ct)
    {
        await _svc.UpdateExpenseAsync(User.GetUserId(), id, dto, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _svc.DeleteExpenseAsync(User.GetUserId(), id, ct);
        return NoContent();
    }
}
