using Monetra.Domain.Common;

namespace Monetra.Domain.Entities;

public class AccountBalanceHistory : Entity
{
    public Guid AccountId { get; private set; }
    public decimal PreviousBalance { get; private set; }
    public decimal NewBalance { get; private set; }
    public string? Notes { get; private set; }

    private AccountBalanceHistory() { }

    public AccountBalanceHistory(Guid accountId, decimal previousBalance, decimal newBalance, string? notes)
    {
        AccountId = accountId;
        PreviousBalance = previousBalance;
        NewBalance = newBalance;
        Notes = notes;
    }
}
