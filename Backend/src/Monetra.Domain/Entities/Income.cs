using Monetra.Domain.Common;
using Monetra.Domain.Enums;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class Income : Entity
{
    public Guid UserId { get; private set; }
    public IncomeType Type { get; private set; }
    public decimal Amount { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public DateTime TransactionDate { get; private set; }

    private Income() { }

    public Income(Guid userId, IncomeType type, decimal amount, string description, DateTime transactionDate)
    {
        UserId = userId;
        Type = type;
        SetAmount(amount);
        SetDescription(description);
        TransactionDate = transactionDate;
    }

    public void Update(IncomeType type, decimal amount, string description, DateTime transactionDate)
    {
        if (!CanEdit())
            throw new DomainException("Past incomes cannot be edited.");
        Type = type;
        SetAmount(amount);
        SetDescription(description);
        TransactionDate = transactionDate;
        Touch();
    }

    private void SetAmount(decimal amount)
    {
        if (amount <= 0)
            throw new DomainException("Income amount must be greater than zero.");
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
