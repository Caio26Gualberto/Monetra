using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetra.Api.Common;
using Monetra.Application.Services;

namespace Monetra.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/financial/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly IFinancialService _svc;
    public TransactionsController(IFinancialService svc) => _svc = svc;

    [HttpGet("month/{month}")]
    public async Task<IActionResult> GetByMonth(string month, [FromQuery] string? type,
        [FromQuery] string? category, [FromQuery] string? sort, CancellationToken ct)
        => Ok(await _svc.GetMonthlyOverviewAsync(User.GetUserId(), month, type, category, sort, ct));

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] string? month, CancellationToken ct)
        => Ok(await _svc.SearchTransactionsAsync(User.GetUserId(), query, month, ct));
}

[ApiController]
[Authorize]
[Route("api/financial/projections")]
public class ProjectionsController : ControllerBase
{
    private readonly IFinancialService _svc;
    public ProjectionsController(IFinancialService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
        => Ok(await _svc.GetProjectionsAsync(User.GetUserId(), 4, ct));

    [HttpGet("{months:int}")]
    public async Task<IActionResult> GetN(int months, CancellationToken ct)
        => Ok(await _svc.GetProjectionsAsync(User.GetUserId(), months, ct));

    [HttpGet("analysis")]
    public async Task<IActionResult> Analysis(CancellationToken ct)
        => Ok(await _svc.GetProjectionAnalysisAsync(User.GetUserId(), ct));
}
