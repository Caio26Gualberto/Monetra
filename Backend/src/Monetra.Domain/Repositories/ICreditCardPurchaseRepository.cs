using Monetra.Domain.Entities;

namespace Monetra.Domain.Repositories;

public interface ICreditCardPurchaseRepository : IRepository<CreditCardPurchase>
{
    Task<IEnumerable<CreditCardPurchase>> GetByCreditCardIdAsync(Guid creditCardId, CancellationToken ct = default);
    Task<IEnumerable<CreditCardPurchase>> GetByCreditCardAndMonthAsync(Guid creditCardId, string month, CancellationToken ct = default);
    Task<IEnumerable<CreditCardPurchase>> GetPendingInstallmentsByUserAsync(Guid userId, CancellationToken ct = default);
}
