using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;
using Monetra.Domain.Enums;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class IncomeRepository : Repository<Income>, IIncomeRepository
{
    public IncomeRepository(MonetraDbContext db) : base(db) { }

    public async Task<IEnumerable<Income>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await Db.Incomes.Where(i => i.UserId == userId)
            .OrderByDescending(i => i.TransactionDate).ToListAsync(ct);

    public async Task<IEnumerable<Income>> GetByMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var (start, end) = MonthRange(month);
        return await Db.Incomes
            .Where(i => i.UserId == userId && i.TransactionDate >= start && i.TransactionDate < end)
            .OrderByDescending(i => i.TransactionDate)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Income>> GetByTypeAsync(Guid userId, IncomeType type, CancellationToken ct = default)
        => await Db.Incomes.Where(i => i.UserId == userId && i.Type == type)
            .OrderByDescending(i => i.TransactionDate).ToListAsync(ct);

    public async Task<decimal> GetTotalByMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var (start, end) = MonthRange(month);
        return await Db.Incomes
            .Where(i => i.UserId == userId && i.TransactionDate >= start && i.TransactionDate < end)
            .SumAsync(i => (decimal?)i.Amount, ct) ?? 0m;
    }

    public async Task<decimal> GetTotalByMonthAndTypeAsync(Guid userId, string month, IncomeType type, CancellationToken ct = default)
    {
        var (start, end) = MonthRange(month);
        return await Db.Incomes
            .Where(i => i.UserId == userId && i.Type == type && i.TransactionDate >= start && i.TransactionDate < end)
            .SumAsync(i => (decimal?)i.Amount, ct) ?? 0m;
    }

    private static (DateTime start, DateTime end) MonthRange(string month)
    {
        var dt = DateTime.ParseExact(month, "yyyy-MM", System.Globalization.CultureInfo.InvariantCulture);
        var start = new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);
        return (start, end);
    }
}
