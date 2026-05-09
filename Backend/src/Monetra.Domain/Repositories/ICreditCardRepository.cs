using Monetra.Domain.Entities;

namespace Monetra.Domain.Repositories;

public interface ICreditCardRepository : IRepository<CreditCard>
{
    Task<IEnumerable<CreditCard>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
}
