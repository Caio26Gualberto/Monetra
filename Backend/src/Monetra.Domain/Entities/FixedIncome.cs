using System.Text.RegularExpressions;
using Monetra.Domain.Common;
using Monetra.Domain.Enums;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class FixedIncome : Entity
{
    private static readonly Regex MonthRegex = new("^\\d{4}-(0[1-9]|1[0-2])$", RegexOptions.Compiled);

    public Guid UserId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public IncomeType Type { get; private set; }
    public string StartMonth { get; private set; } = string.Empty;

    private FixedIncome() { }

    public FixedIncome(Guid userId, string description, decimal amount, IncomeType type, string startMonth)
    {
        UserId = userId;
        Type = type;
        SetDescription(description);
        SetAmount(amount);
        SetStartMonth(startMonth);
    }

    public void Update(string description, decimal amount, IncomeType type, string startMonth)
    {
        Type = type;
        SetDescription(description);
        SetAmount(amount);
        SetStartMonth(startMonth);
        Touch();
    }

    public bool IsActiveIn(string month) =>
        string.Compare(StartMonth, month, StringComparison.Ordinal) <= 0;

    private void SetDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new DomainException("Description is required.");
        Description = description.Trim();
    }

    private void SetAmount(decimal amount)
    {
        if (amount <= 0)
            throw new DomainException("Fixed income amount must be greater than zero.");
        Amount = amount;
    }

    private void SetStartMonth(string month)
    {
        if (string.IsNullOrWhiteSpace(month) || !MonthRegex.IsMatch(month))
            throw new DomainException("Start month must be in yyyy-MM format.");
        StartMonth = month;
    }
}
