using Monetra.Domain.Entities;

namespace Monetra.Domain.Repositories;

public interface IFixedIncomeRepository : IRepository<FixedIncome>
{
    Task<IEnumerable<FixedIncome>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<FixedIncome>> GetActiveForMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task<decimal> GetTotalForMonthAsync(Guid userId, string month, CancellationToken ct = default);
}
