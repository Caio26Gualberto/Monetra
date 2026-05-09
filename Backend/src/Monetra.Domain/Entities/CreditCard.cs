using Monetra.Domain.Common;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class CreditCard : Entity
{
    public Guid UserId { get; private set; }
    public string CardName { get; private set; } = string.Empty;
    public decimal TotalAmount { get; private set; }
    public DateTime DueDate { get; private set; }
    public string Month { get; private set; } = string.Empty; // yyyy-MM
    public bool IsPaid { get; private set; }

    private CreditCard() { }

    public CreditCard(Guid userId, string cardName, decimal totalAmount, DateTime dueDate, string month)
    {
        UserId = userId;
        SetCardName(cardName);
        SetTotalAmount(totalAmount);
        DueDate = dueDate;
        SetMonth(month);
        IsPaid = false;
    }

    public void Update(string cardName, decimal totalAmount, DateTime dueDate, string month)
    {
        SetCardName(cardName);
        SetTotalAmount(totalAmount);
        DueDate = dueDate;
        SetMonth(month);
        Touch();
    }

    public void MarkAsPaid()
    {
        IsPaid = true;
        Touch();
    }

    public void MarkAsUnpaid()
    {
        IsPaid = false;
        Touch();
    }

    private void SetCardName(string cardName)
    {
        if (string.IsNullOrWhiteSpace(cardName))
            throw new DomainException("Card name is required.");
        CardName = cardName.Trim();
    }

    private void SetTotalAmount(decimal totalAmount)
    {
        if (totalAmount < 0)
            throw new DomainException("Total amount cannot be negative.");
        TotalAmount = totalAmount;
    }

    private void SetMonth(string month)
    {
        if (string.IsNullOrWhiteSpace(month) || !System.Text.RegularExpressions.Regex.IsMatch(month, @"^\d{4}-\d{2}$"))
            throw new DomainException("Month must be in yyyy-MM format.");
        Month = month;
    }
}
