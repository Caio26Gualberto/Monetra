using Monetra.Application.Common.Exceptions;
using Monetra.Application.DTOs.CreditCard;
using Monetra.Domain.Entities;

namespace Monetra.Application.Services;

public partial class FinancialService
{
    // ===================== CREDIT CARD =====================
    public async Task<CreditCardDto> CreateCreditCardAsync(Guid userId, CreateCreditCardDto dto, CancellationToken ct = default)
    {
        var card = new Domain.Entities.CreditCard(userId, dto.CardName, dto.TotalAmount, dto.DueDate, dto.Month);
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
        var card = await _cards.GetByIdAsync(cardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        return _mapper.Map<CreditCardDto>(card);
    }

    public async Task<IEnumerable<CreditCardDto>> GetCreditCardsByMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var list = await _cards.GetByMonthAsync(userId, month, ct);
        return list.Select(c => _mapper.Map<CreditCardDto>(c));
    }

    public async Task UpdateCreditCardAsync(Guid userId, Guid cardId, UpdateCreditCardDto dto, CancellationToken ct = default)
    {
        var card = await _cards.GetByIdAsync(cardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        card.Update(dto.CardName, dto.TotalAmount, dto.DueDate, dto.Month);
        await _cards.UpdateAsync(card, ct);
    }

    public async Task MarkCreditCardAsPaidAsync(Guid userId, Guid cardId, CancellationToken ct = default)
    {
        var card = await _cards.GetByIdAsync(cardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        card.MarkAsPaid();
        await _cards.UpdateAsync(card, ct);
    }

    public async Task DeleteCreditCardAsync(Guid userId, Guid cardId, CancellationToken ct = default)
    {
        var card = await _cards.GetByIdAsync(cardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        await _cards.DeleteAsync(cardId, ct);
    }

    // ===================== PURCHASES =====================
    public async Task<CreditCardPurchaseDto> CreatePurchaseAsync(Guid userId, Guid cardId, CreatePurchaseDto dto, CancellationToken ct = default)
    {
        var card = await _cards.GetByIdAsync(cardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        var purchase = new CreditCardPurchase(cardId, dto.Description, dto.Amount, dto.TotalInstallments, dto.PurchaseDate);
        await _purchases.AddAsync(purchase, ct);
        return _mapper.Map<CreditCardPurchaseDto>(purchase);
    }

    public async Task<IEnumerable<CreditCardPurchaseDto>> GetPurchasesAsync(Guid userId, Guid cardId, CancellationToken ct = default)
    {
        var card = await _cards.GetByIdAsync(cardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        var list = await _purchases.GetByCreditCardIdAsync(cardId, ct);
        return list.Select(p => _mapper.Map<CreditCardPurchaseDto>(p));
    }

    public async Task<IEnumerable<CreditCardPurchaseDto>> GetPurchasesByMonthAsync(Guid userId, Guid cardId, string month, CancellationToken ct = default)
    {
        var card = await _cards.GetByIdAsync(cardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        var list = await _purchases.GetByCreditCardAndMonthAsync(cardId, month, ct);
        return list.Select(p => _mapper.Map<CreditCardPurchaseDto>(p));
    }

    public async Task UpdatePurchaseAsync(Guid userId, Guid purchaseId, UpdatePurchaseDto dto, CancellationToken ct = default)
    {
        var purchase = await _purchases.GetByIdAsync(purchaseId, ct)
                       ?? throw new NotFoundException("Purchase not found.");
        var card = await _cards.GetByIdAsync(purchase.CreditCardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        purchase.Update(dto.Description, dto.Amount, dto.TotalInstallments, dto.PurchaseDate);
        await _purchases.UpdateAsync(purchase, ct);
    }

    public async Task DeletePurchaseAsync(Guid userId, Guid purchaseId, CancellationToken ct = default)
    {
        var purchase = await _purchases.GetByIdAsync(purchaseId, ct)
                       ?? throw new NotFoundException("Purchase not found.");
        var card = await _cards.GetByIdAsync(purchase.CreditCardId, ct)
                   ?? throw new NotFoundException("Credit card not found.");
        if (card.UserId != userId) throw new UnauthorizedException("Forbidden.");
        await _purchases.DeleteAsync(purchaseId, ct);
    }

    public async Task<CreditCardSummaryDto> GetCreditCardSummaryAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var cards = (await _cards.GetByMonthAsync(userId, month, ct)).ToList();
        var pending = (await _purchases.GetPendingInstallmentsByUserAsync(userId, ct)).ToList();
        var pendingTotal = pending.Sum(p => p.GetInstallmentValue() * p.GetRemainingInstallments());
        return new CreditCardSummaryDto(
            month,
            cards.Sum(c => c.TotalAmount),
            cards.Count,
            pendingTotal,
            pending.Count
        );
    }

    public async Task<IEnumerable<CreditCardPurchaseDto>> GetPendingInstallmentsAsync(Guid userId, CancellationToken ct = default)
    {
        var list = await _purchases.GetPendingInstallmentsByUserAsync(userId, ct);
        return list.Select(p => _mapper.Map<CreditCardPurchaseDto>(p));
    }
}
