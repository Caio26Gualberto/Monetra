using Monetra.Domain.Entities;

namespace Monetra.Domain.Repositories;

public interface ICreditCardInvoicePaymentRepository : IRepository<CreditCardInvoicePayment>
{
    Task<CreditCardInvoicePayment?> GetAsync(Guid creditCardId, string month, CancellationToken ct = default);
    Task<IEnumerable<CreditCardInvoicePayment>> GetByCardAsync(Guid creditCardId, CancellationToken ct = default);
    Task<IEnumerable<CreditCardInvoicePayment>> GetByUserAsync(Guid userId, CancellationToken ct = default);
    Task DeleteAsync(Guid creditCardId, string month, CancellationToken ct = default);
}
