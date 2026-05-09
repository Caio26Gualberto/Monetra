using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetra.Api.Common;
using Monetra.Application.Services;

namespace Monetra.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/financial/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IFinancialService _svc;
    public DashboardController(IFinancialService svc) => _svc = svc;

    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] string? month, CancellationToken ct)
        => Ok(await _svc.GetDashboardSummaryAsync(User.GetUserId(), month, ct));

    [HttpGet("summary/{month}")]
    public async Task<IActionResult> SummaryByMonth(string month, CancellationToken ct)
        => Ok(await _svc.GetDashboardSummaryAsync(User.GetUserId(), month, ct));

    [HttpGet("evolution/{months:int}")]
    public async Task<IActionResult> Evolution(int months, CancellationToken ct)
        => Ok(await _svc.GetEvolutionAsync(User.GetUserId(), months, ct));

    [HttpGet("distribution/{month}")]
    public async Task<IActionResult> Distribution(string month, CancellationToken ct)
        => Ok(await _svc.GetDistributionAsync(User.GetUserId(), month, ct));

    [HttpGet("recent-transactions")]
    public async Task<IActionResult> RecentTransactions(CancellationToken ct)
        => Ok(await _svc.GetRecentTransactionsAsync(User.GetUserId(), ct));
}
