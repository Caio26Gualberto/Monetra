using Monetra.Domain.Common;
using Monetra.Domain.Exceptions;

namespace Monetra.Domain.Entities;

public class CreditCardInvoicePayment : Entity
{
    public Guid CreditCardId { get; private set; }
    public string Month { get; private set; } = string.Empty; // yyyy-MM
    public DateTime PaidAt { get; private set; }

    private CreditCardInvoicePayment() { }

    public CreditCardInvoicePayment(Guid creditCardId, string month)
    {
        CreditCardId = creditCardId;
        SetMonth(month);
        PaidAt = DateTime.UtcNow;
    }

    private void SetMonth(string month)
    {
        if (string.IsNullOrWhiteSpace(month) || !System.Text.RegularExpressions.Regex.IsMatch(month, @"^\d{4}-\d{2}$"))
            throw new DomainException("Month must be in yyyy-MM format.");
        Month = month;
    }
}
