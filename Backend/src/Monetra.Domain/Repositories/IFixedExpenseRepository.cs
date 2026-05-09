using Monetra.Domain.Entities;

namespace Monetra.Domain.Repositories;

public interface IFixedExpenseRepository : IRepository<FixedExpense>
{
    Task<IEnumerable<FixedExpense>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<FixedExpense>> GetActiveForMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task<decimal> GetTotalForMonthAsync(Guid userId, string month, CancellationToken ct = default);
}
