using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetra.Api.Common;
using Monetra.Application.DTOs.Account;
using Monetra.Application.Services;

namespace Monetra.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/financial/account")]
public class AccountController : ControllerBase
{
    private readonly IFinancialService _svc;
    public AccountController(IFinancialService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
        => Ok(await _svc.GetAccountAsync(User.GetUserId(), ct));

    [HttpPut("balance")]
    public async Task<IActionResult> UpdateBalance([FromBody] UpdateAccountBalanceDto dto, CancellationToken ct)
    {
        await _svc.UpdateAccountBalanceAsync(User.GetUserId(), dto, ct);
        return NoContent();
    }

    [HttpGet("history")]
    public async Task<IActionResult> History(CancellationToken ct)
        => Ok(await _svc.GetAccountHistoryAsync(User.GetUserId(), ct));
}
