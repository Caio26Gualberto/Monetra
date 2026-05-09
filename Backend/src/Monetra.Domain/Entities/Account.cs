using Monetra.Domain.Common;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class Account : Entity
{
    public Guid UserId { get; private set; }
    public decimal CurrentBalance { get; private set; }

    private Account() { }

    public Account(Guid userId, decimal initialBalance = 0m)
    {
        UserId = userId;
        SetBalance(initialBalance);
    }

    public void SetBalance(decimal newBalance)
    {
        if (newBalance < 0)
            throw new DomainException("Balance cannot be negative.");
        CurrentBalance = newBalance;
        Touch();
    }
}
