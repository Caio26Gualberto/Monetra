using Monetra.Domain.Common;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class CreditCardPurchase : Entity
{
    public Guid CreditCardId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public int TotalInstallments { get; private set; }
    public int CurrentInstallment { get; private set; }
    public DateTime PurchaseDate { get; private set; }

    private CreditCardPurchase() { }

    public CreditCardPurchase(Guid creditCardId, string description, decimal amount, int totalInstallments, DateTime purchaseDate)
    {
        CreditCardId = creditCardId;
        SetDescription(description);
        SetAmount(amount);
        SetInstallments(totalInstallments);
        PurchaseDate = purchaseDate;
        CurrentInstallment = 1;
    }

    public void Update(string description, decimal amount, int totalInstallments, DateTime purchaseDate)
    {
        if (!CanEdit())
            throw new DomainException("Past purchases cannot be edited.");
        SetDescription(description);
        SetAmount(amount);
        SetInstallments(totalInstallments);
        PurchaseDate = purchaseDate;
        Touch();
    }

    public void AdvanceInstallment()
    {
        if (CurrentInstallment < TotalInstallments)
        {
            CurrentInstallment++;
            Touch();
        }
    }

    public decimal GetInstallmentValue() =>
        TotalInstallments == 0 ? 0 : Math.Round(Amount / TotalInstallments, 2);

    public int GetRemainingInstallments() =>
        Math.Max(0, TotalInstallments - CurrentInstallment + 1);

    private void SetDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new DomainException("Purchase description is required.");
        Description = description.Trim();
    }

    private void SetAmount(decimal amount)
    {
        if (amount <= 0)
            throw new DomainException("Purchase amount must be greater than zero.");
        Amount = amount;
    }

    private void SetInstallments(int totalInstallments)
    {
        if (totalInstallments < 1 || totalInstallments > 24)
            throw new DomainException("Installments must be between 1 and 24.");
        TotalInstallments = totalInstallments;
    }

    public bool CanEdit() => PurchaseDate.Date >= DateTime.UtcNow.Date;
    public bool CanDelete() => true;
}
