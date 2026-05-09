using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Monetra.Api.Common;
using Monetra.Application.DTOs.CreditCard;
using Monetra.Application.Services;

namespace Monetra.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/financial/creditcard")]
public class CreditCardController : ControllerBase
{
    private readonly IFinancialService _svc;
    public CreditCardController(IFinancialService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _svc.GetCreditCardsAsync(User.GetUserId(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _svc.GetCreditCardAsync(User.GetUserId(), id, ct));

    [HttpGet("month/{month}")]
    public async Task<IActionResult> GetByMonth(string month, CancellationToken ct)
        => Ok(await _svc.GetCreditCardsByMonthAsync(User.GetUserId(), month, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCreditCardDto dto, CancellationToken ct)
        => Ok(await _svc.CreateCreditCardAsync(User.GetUserId(), dto, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCreditCardDto dto, CancellationToken ct)
    {
        await _svc.UpdateCreditCardAsync(User.GetUserId(), id, dto, ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/pay")]
    public async Task<IActionResult> MarkAsPaid(Guid id, CancellationToken ct)
    {
        await _svc.MarkCreditCardAsPaidAsync(User.GetUserId(), id, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _svc.DeleteCreditCardAsync(User.GetUserId(), id, ct);
        return NoContent();
    }

    // Purchases
    [HttpGet("{id:guid}/purchases")]
    public async Task<IActionResult> GetPurchases(Guid id, CancellationToken ct)
        => Ok(await _svc.GetPurchasesAsync(User.GetUserId(), id, ct));

    [HttpGet("{id:guid}/purchases/month/{month}")]
    public async Task<IActionResult> GetPurchasesByMonth(Guid id, string month, CancellationToken ct)
        => Ok(await _svc.GetPurchasesByMonthAsync(User.GetUserId(), id, month, ct));

    [HttpPost("{id:guid}/purchases")]
    public async Task<IActionResult> CreatePurchase(Guid id, [FromBody] CreatePurchaseDto dto, CancellationToken ct)
        => Ok(await _svc.CreatePurchaseAsync(User.GetUserId(), id, dto, ct));

    [HttpPut("purchases/{purchaseId:guid}")]
    public async Task<IActionResult> UpdatePurchase(Guid purchaseId, [FromBody] UpdatePurchaseDto dto, CancellationToken ct)
    {
        await _svc.UpdatePurchaseAsync(User.GetUserId(), purchaseId, dto, ct);
        return NoContent();
    }

    [HttpDelete("purchases/{purchaseId:guid}")]
    public async Task<IActionResult> DeletePurchase(Guid purchaseId, CancellationToken ct)
    {
        await _svc.DeletePurchaseAsync(User.GetUserId(), purchaseId, ct);
        return NoContent();
    }

    [HttpGet("summary/{month}")]
    public async Task<IActionResult> Summary(string month, CancellationToken ct)
        => Ok(await _svc.GetCreditCardSummaryAsync(User.GetUserId(), month, ct));

    [HttpGet("pending-installments")]
    public async Task<IActionResult> PendingInstallments(CancellationToken ct)
        => Ok(await _svc.GetPendingInstallmentsAsync(User.GetUserId(), ct));
}
