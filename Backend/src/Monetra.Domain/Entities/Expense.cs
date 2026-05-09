using Monetra.Domain.Common;
using Monetra.Domain.Enums;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class Expense : Entity
{
    public Guid UserId { get; private set; }
    public ExpenseCategory Category { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentMethod PaymentMethod { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public DateTime TransactionDate { get; private set; }

    private Expense() { }

    public Expense(Guid userId, ExpenseCategory category, decimal amount, PaymentMethod paymentMethod, string description, DateTime transactionDate)
    {
        UserId = userId;
        Category = category;
        PaymentMethod = paymentMethod;
        SetAmount(amount);
        SetDescription(description);
        TransactionDate = transactionDate;
    }

    public void Update(ExpenseCategory category, decimal amount, PaymentMethod paymentMethod, string description, DateTime transactionDate)
    {
        if (!CanEdit())
            throw new DomainException("Past expenses cannot be edited.");
        Category = category;
        PaymentMethod = paymentMethod;
        SetAmount(amount);
        SetDescription(description);
        TransactionDate = transactionDate;
        Touch();
    }

    private void SetAmount(decimal amount)
    {
        if (amount <= 0)
            throw new DomainException("Expense amount must be greater than zero.");
        Amount = amount;
    }

    private void SetDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new DomainException("Description is required.");
        Description = description.Trim();
    }

    public bool CanEdit() => TransactionDate.Date >= DateTime.UtcNow.Date;
    public bool CanDelete() => true;
}
