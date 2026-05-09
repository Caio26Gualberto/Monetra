using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetra.Api.Common;
using Monetra.Application.DTOs.Expense;
using Monetra.Application.Services;

namespace Monetra.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/financial/fixed-expense")]
public class FixedExpenseController : ControllerBase
{
    private readonly IFinancialService _svc;
    public FixedExpenseController(IFinancialService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _svc.GetFixedExpensesAsync(User.GetUserId(), ct));

    [HttpGet("month/{month}")]
    public async Task<IActionResult> GetForMonth(string month, CancellationToken ct)
        => Ok(await _svc.GetFixedExpensesForMonthAsync(User.GetUserId(), month, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFixedExpenseDto dto, CancellationToken ct)
        => Ok(await _svc.CreateFixedExpenseAsync(User.GetUserId(), dto, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFixedExpenseDto dto, CancellationToken ct)
    {
        await _svc.UpdateFixedExpenseAsync(User.GetUserId(), id, dto, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _svc.DeleteFixedExpenseAsync(User.GetUserId(), id, ct);
        return NoContent();
    }
}
