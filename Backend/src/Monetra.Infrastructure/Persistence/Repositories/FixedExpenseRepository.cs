using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class FixedExpenseRepository : Repository<FixedExpense>, IFixedExpenseRepository
{
    public FixedExpenseRepository(MonetraDbContext db) : base(db) { }

    public async Task<IEnumerable<FixedExpense>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await Db.FixedExpenses
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.StartMonth)
            .ThenBy(x => x.Description)
            .ToListAsync(ct);

    public async Task<IEnumerable<FixedExpense>> GetActiveForMonthAsync(Guid userId, string month, CancellationToken ct = default)
        => await Db.FixedExpenses
            .Where(x => x.UserId == userId && string.Compare(x.StartMonth, month) <= 0)
            .OrderBy(x => x.Description)
            .ToListAsync(ct);

    public async Task<decimal> GetTotalForMonthAsync(Guid userId, string month, CancellationToken ct = default)
        => await Db.FixedExpenses
            .Where(x => x.UserId == userId && string.Compare(x.StartMonth, month) <= 0)
            .SumAsync(x => (decimal?)x.Amount, ct) ?? 0m;
}
