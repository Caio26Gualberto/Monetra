using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetra.Api.Common;
using Monetra.Application.DTOs.Income;
using Monetra.Application.Services;

namespace Monetra.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/financial/income")]
public class IncomeController : ControllerBase
{
    private readonly IFinancialService _svc;
    public IncomeController(IFinancialService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _svc.GetIncomesAsync(User.GetUserId(), ct));

    [HttpGet("month/{month}")]
    public async Task<IActionResult> GetByMonth(string month, CancellationToken ct)
        => Ok(await _svc.GetIncomesByMonthAsync(User.GetUserId(), month, ct));

    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetByType(string type, CancellationToken ct)
        => Ok(await _svc.GetIncomesByTypeAsync(User.GetUserId(), type, ct));

    [HttpGet("summary/{month}")]
    public async Task<IActionResult> Summary(string month, CancellationToken ct)
        => Ok(await _svc.GetIncomeSummaryAsync(User.GetUserId(), month, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIncomeDto dto, CancellationToken ct)
        => Ok(await _svc.CreateIncomeAsync(User.GetUserId(), dto, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateIncomeDto dto, CancellationToken ct)
    {
        await _svc.UpdateIncomeAsync(User.GetUserId(), id, dto, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _svc.DeleteIncomeAsync(User.GetUserId(), id, ct);
        return NoContent();
    }
}
