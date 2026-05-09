using System.Text.RegularExpressions;
using Monetra.Domain.Common;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class CreditCardPurchase : Entity
{
    private static readonly Regex MonthRegex = new("^\\d{4}-(0[1-9]|1[0-2])$", RegexOptions.Compiled);

    public Guid CreditCardId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public int TotalInstallments { get; private set; }
    public int CurrentInstallment { get; private set; }
    public DateTime PurchaseDate { get; private set; }
    public string InstallmentScheduleStartMonth { get; private set; } = string.Empty;

    private CreditCardPurchase() { }

    public CreditCardPurchase(Guid creditCardId, string description, decimal amount, int totalInstallments, int currentInstallment, DateTime purchaseDate, string installmentScheduleStartMonth)
    {
        CreditCardId = creditCardId;
        SetDescription(description);
        SetAmount(amount);
        SetInstallments(totalInstallments, currentInstallment);
        PurchaseDate = purchaseDate;
        SetScheduleStartMonth(installmentScheduleStartMonth);
    }

    public void Update(string description, decimal amount, int totalInstallments, int currentInstallment, DateTime purchaseDate, string installmentScheduleStartMonth)
    {
        SetDescription(description);
        SetAmount(amount);
        SetInstallments(totalInstallments, currentInstallment);
        PurchaseDate = purchaseDate;
        SetScheduleStartMonth(installmentScheduleStartMonth);
        Touch();
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

    private void SetInstallments(int totalInstallments, int currentInstallment)
    {
        if (totalInstallments < 1 || totalInstallments > 24)
            throw new DomainException("Installments must be between 1 and 24.");
        if (currentInstallment < 1 || currentInstallment > totalInstallments)
            throw new DomainException("Current installment must be between 1 and total installments.");
        TotalInstallments = totalInstallments;
        CurrentInstallment = currentInstallment;
    }

    public bool CanDelete() => true;

    private void SetScheduleStartMonth(string month)
    {
        if (string.IsNullOrWhiteSpace(month) || !MonthRegex.IsMatch(month))
            throw new DomainException("Installment schedule start month must be in yyyy-MM format.");
        InstallmentScheduleStartMonth = month;
    }
}
