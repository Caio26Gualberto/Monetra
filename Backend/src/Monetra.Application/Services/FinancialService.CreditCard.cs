using Monetra.Application.Common.Exceptions;
using Monetra.Application.DTOs.CreditCard;
using Monetra.Domain.Entities;
using Monetra.Domain.Services;

namespace Monetra.Application.Services;

public partial class FinancialService
{
    // ===================== CREDIT CARD =====================
    public async Task<CreditCardDto> CreateCreditCardAsync(Guid userId, CreateCreditCardDto dto, CancellationToken ct = default)
    {
        var card = new Domain.Entities.CreditCard(userId, dto.CardName, dto.ClosingDay, dto.DueDay);
        await _cards.AddAsync(card, ct);
        return _mapper.Map<CreditCardDto>(card);
    }

    public async Task<IEnumerable<CreditCardDto>> GetCreditCardsAsync(Guid userId, CancellationToken ct = default)
    {
        var list = await _cards.GetByUserIdAsync(userId, ct);
        return list.Select(c => _mapper.Map<CreditCardDto>(c));
    }

    public async Task<CreditCardDto> GetCreditCardAsync(Guid userId, Guid cardId, CancellationToken ct = default)
    {
        var card = await EnsureCardOwnedAsync(userId, cardId, ct);
        return _mapper.Map<CreditCardDto>(card);
    }

    public async Task UpdateCreditCardAsync(Guid userId, Guid cardId, UpdateCreditCardDto dto, CancellationToken ct = default)
    {
        var card = await EnsureCardOwnedAsync(userId, cardId, ct);
        card.Update(dto.CardName, dto.ClosingDay, dto.DueDay);
        await _cards.UpdateAsync(card, ct);
    }

    public async Task DeleteCreditCardAsync(Guid userId, Guid cardId, CancellationToken ct = default)
    {
        var card = await EnsureCardOwnedAsync(userId, cardId, ct);
        await _cards.DeleteAsync(card.Id, ct);
    }

    // ===================== INVOICES =====================
    public async Task<CreditCardInvoiceDto> GetInvoiceAsync(Guid userId, Guid cardId, string month, CancellationToken ct = default)
    {
        var card = await EnsureCardOwnedAsync(userId, cardId, ct);
        var purchases = (await _purchases.GetByCreditCardIdAsync(cardId, ct)).ToList();
        var lines = BuildInvoiceLines(purchases, card.ClosingDay, month).ToList();
        var payment = await _invoicePayments.GetAsync(cardId, month, ct);
        return new CreditCardInvoiceDto(
            card.Id,
            card.CardName,
            month,
            InvoiceMonthCalculator.DueDateFor(month, card.DueDay),
            lines.Sum(l => l.InstallmentValue),
            payment != null,
            lines
        );
    }

    public async Task MarkInvoiceAsPaidAsync(Guid userId, Guid cardId, string month, CancellationToken ct = default)
    {
        var card = await EnsureCardOwnedAsync(userId, cardId, ct);
        var existing = await _invoicePayments.GetAsync(card.Id, month, ct);
        if (existing != null) return;
        var payment = new CreditCardInvoicePayment(card.Id, month);
        await _invoicePayments.AddAsync(payment, ct);
    }

    public async Task MarkInvoiceAsUnpaidAsync(Guid userId, Guid cardId, string month, CancellationToken ct = default)
    {
        var card = await EnsureCardOwnedAsync(userId, cardId, ct);
        await _invoicePayments.DeleteAsync(card.Id, month, ct);
    }

    // ===================== PURCHASES =====================
    public async Task<CreditCardPurchaseDto> CreatePurchaseAsync(Guid userId, Guid cardId, CreatePurchaseDto dto, CancellationToken ct = default)
    {
        var card = await EnsureCardOwnedAsync(userId, cardId, ct);
        var purchase = new CreditCardPurchase(cardId, dto.Description, dto.Amount, dto.TotalInstallments, dto.CurrentInstallment, dto.PurchaseDate);
        await _purchases.AddAsync(purchase, ct);
        return ToPurchaseDto(purchase, card.ClosingDay);
    }

    public async Task<IEnumerable<CreditCardPurchaseDto>> GetPurchasesAsync(Guid userId, Guid cardId, CancellationToken ct = default)
    {
        var card = await EnsureCardOwnedAsync(userId, cardId, ct);
        var list = await _purchases.GetByCreditCardIdAsync(cardId, ct);
        return list.Select(p => ToPurchaseDto(p, card.ClosingDay));
    }

    public async Task UpdatePurchaseAsync(Guid userId, Guid purchaseId, UpdatePurchaseDto dto, CancellationToken ct = default)
    {
        var purchase = await _purchases.GetByIdAsync(purchaseId, ct)
                       ?? throw new NotFoundException("Purchase not found.");
        var card = await EnsureCardOwnedAsync(userId, purchase.CreditCardId, ct);
        _ = card;
        purchase.Update(dto.Description, dto.Amount, dto.TotalInstallments, dto.CurrentInstallment, dto.PurchaseDate);
        await _purchases.UpdateAsync(purchase, ct);
    }

    public async Task DeletePurchaseAsync(Guid userId, Guid purchaseId, CancellationToken ct = default)
    {
        var purchase = await _purchases.GetByIdAsync(purchaseId, ct)
                       ?? throw new NotFoundException("Purchase not found.");
        await EnsureCardOwnedAsync(userId, purchase.CreditCardId, ct);
        await _purchases.DeleteAsync(purchaseId, ct);
    }

    public async Task<CreditCardSummaryDto> GetCreditCardSummaryAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var cards = (await _cards.GetByUserIdAsync(userId, ct)).ToList();
        var allPurchases = (await _purchases.GetByUserIdAsync(userId, ct)).ToList();

        decimal monthTotal = 0;
        int cardsWithInvoice = 0;
        foreach (var card in cards)
        {
            var cardPurchases = allPurchases.Where(p => p.CreditCardId == card.Id);
            var lines = BuildInvoiceLines(cardPurchases, card.ClosingDay, month).ToList();
            var sum = lines.Sum(l => l.InstallmentValue);
            monthTotal += sum;
            if (sum > 0) cardsWithInvoice++;
        }

        var pending = allPurchases.Where(p => p.CurrentInstallment <= p.TotalInstallments).ToList();
        var pendingTotal = pending.Sum(p => p.GetInstallmentValue() * p.GetRemainingInstallments());

        return new CreditCardSummaryDto(
            month,
            monthTotal,
            cardsWithInvoice,
            pendingTotal,
            pending.Count
        );
    }

    public async Task<IEnumerable<CreditCardPurchaseDto>> GetPendingInstallmentsAsync(Guid userId, CancellationToken ct = default)
    {
        var list = (await _purchases.GetPendingInstallmentsByUserAsync(userId, ct)).ToList();
        var cards = (await _cards.GetByUserIdAsync(userId, ct)).ToDictionary(c => c.Id);
        return list.Select(p => ToPurchaseDto(p, cards.TryGetValue(p.CreditCardId, out var c) ? c.ClosingDay : 1));
    }

    // ===================== HELPERS =====================
    internal async Task<Domain.Entities.CreditCard> EnsureCardOwnedAsync(Guid userId, Guid cardId, CancellationToken ct)
    {
        var card = await _cards.GetByIdAsync(cardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        return card;
    }

    internal static CreditCardPurchaseDto ToPurchaseDto(CreditCardPurchase p, int closingDay)
    {
        return new CreditCardPurchaseDto(
            p.Id,
            p.CreditCardId,
            p.Description,
            p.Amount,
            p.TotalInstallments,
            p.CurrentInstallment,
            p.GetInstallmentValue(),
            p.PurchaseDate,
            InvoiceMonthCalculator.FirstInvoiceMonth(p.PurchaseDate, closingDay)
        );
    }

    /// <summary>
    /// Yields invoice lines for a given month/card considering installments schedule.
    /// The second parameter is unused but kept to avoid captures; pass-through.
    /// </summary>
    internal static IEnumerable<InvoiceLineDto> BuildInvoiceLines(IEnumerable<CreditCardPurchase> purchases, int closingDay, string month)
    {
        foreach (var p in purchases)
        {
            for (var n = p.CurrentInstallment; n <= p.TotalInstallments; n++)
            {
                var installmentMonth = InvoiceMonthCalculator.InvoiceMonthForInstallment(p.PurchaseDate, closingDay, p.CurrentInstallment, n);
                if (installmentMonth == month)
                {
                    yield return new InvoiceLineDto(
                        p.Id,
                        p.Description,
                        n,
                        p.TotalInstallments,
                        p.GetInstallmentValue(),
                        p.PurchaseDate
                    );
                    break;
                }
            }
        }
    }
}
