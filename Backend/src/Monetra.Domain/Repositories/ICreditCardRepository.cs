using Monetra.Domain.Entities;

namespace Monetra.Domain.Repositories;

public interface ICreditCardRepository : IRepository<CreditCard>
{
    Task<IEnumerable<CreditCard>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<CreditCard>> GetByMonthAsync(Guid userId, string month, CancellationToken ct = default);
}
