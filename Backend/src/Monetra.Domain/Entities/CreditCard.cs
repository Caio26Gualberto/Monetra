using Monetra.Domain.Common;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class CreditCard : Entity
{
    public Guid UserId { get; private set; }
    public string CardName { get; private set; } = string.Empty;
    public int ClosingDay { get; private set; }
    public int DueDay { get; private set; }

    private CreditCard() { }

    public CreditCard(Guid userId, string cardName, int closingDay, int dueDay)
    {
        UserId = userId;
        SetCardName(cardName);
        SetClosingDay(closingDay);
        SetDueDay(dueDay);
    }

    public void Update(string cardName, int closingDay, int dueDay)
    {
        SetCardName(cardName);
        SetClosingDay(closingDay);
        SetDueDay(dueDay);
        Touch();
    }

    private void SetCardName(string cardName)
    {
        if (string.IsNullOrWhiteSpace(cardName))
            throw new DomainException("Card name is required.");
        CardName = cardName.Trim();
    }

    private void SetClosingDay(int closingDay)
    {
        if (closingDay < 1 || closingDay > 31)
            throw new DomainException("Closing day must be between 1 and 31.");
        ClosingDay = closingDay;
    }

    private void SetDueDay(int dueDay)
    {
        if (dueDay < 1 || dueDay > 31)
            throw new DomainException("Due day must be between 1 and 31.");
        DueDay = dueDay;
    }
}
