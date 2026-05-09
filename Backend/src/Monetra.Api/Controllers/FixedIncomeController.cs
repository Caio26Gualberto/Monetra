using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetra.Api.Common;
using Monetra.Application.DTOs.Income;
using Monetra.Application.Services;

namespace Monetra.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/financial/fixed-income")]
public class FixedIncomeController : ControllerBase
{
    private readonly IFinancialService _svc;
    public FixedIncomeController(IFinancialService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _svc.GetFixedIncomesAsync(User.GetUserId(), ct));

    [HttpGet("month/{month}")]
    public async Task<IActionResult> GetForMonth(string month, CancellationToken ct)
        => Ok(await _svc.GetFixedIncomesForMonthAsync(User.GetUserId(), month, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFixedIncomeDto dto, CancellationToken ct)
        => Ok(await _svc.CreateFixedIncomeAsync(User.GetUserId(), dto, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFixedIncomeDto dto, CancellationToken ct)
    {
        await _svc.UpdateFixedIncomeAsync(User.GetUserId(), id, dto, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _svc.DeleteFixedIncomeAsync(User.GetUserId(), id, ct);
        return NoContent();
    }
}
