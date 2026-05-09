using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;
using Monetra.Domain.Enums;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class ExpenseRepository : Repository<Expense>, IExpenseRepository
{
    public ExpenseRepository(MonetraDbContext db) : base(db) { }

    public async Task<IEnumerable<Expense>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await Db.Expenses.Where(e => e.UserId == userId)
            .OrderByDescending(e => e.TransactionDate).ToListAsync(ct);

    public async Task<IEnumerable<Expense>> GetByMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var (s, e) = MonthRange(month);
        return await Db.Expenses
            .Where(x => x.UserId == userId && x.TransactionDate >= s && x.TransactionDate < e)
            .OrderByDescending(x => x.TransactionDate)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Expense>> GetByCategoryAsync(Guid userId, ExpenseCategory category, CancellationToken ct = default)
        => await Db.Expenses.Where(x => x.UserId == userId && x.Category == category)
            .OrderByDescending(x => x.TransactionDate).ToListAsync(ct);

    public async Task<IEnumerable<Expense>> GetByPaymentMethodAsync(Guid userId, PaymentMethod method, CancellationToken ct = default)
        => await Db.Expenses.Where(x => x.UserId == userId && x.PaymentMethod == method)
            .OrderByDescending(x => x.TransactionDate).ToListAsync(ct);

    public async Task<decimal> GetTotalByMonthAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var (s, e) = MonthRange(month);
        return await Db.Expenses
            .Where(x => x.UserId == userId && x.TransactionDate >= s && x.TransactionDate < e)
            .SumAsync(x => (decimal?)x.Amount, ct) ?? 0m;
    }

    public async Task<IDictionary<ExpenseCategory, decimal>> GetTotalByCategoryAsync(Guid userId, string month, CancellationToken ct = default)
    {
        var (s, e) = MonthRange(month);
        var grouped = await Db.Expenses
            .Where(x => x.UserId == userId && x.TransactionDate >= s && x.TransactionDate < e)
            .GroupBy(x => x.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount) })
            .ToListAsync(ct);
        return grouped.ToDictionary(x => x.Category, x => x.Total);
    }

    private static (DateTime start, DateTime end) MonthRange(string month)
    {
        var dt = DateTime.ParseExact(month, "yyyy-MM", System.Globalization.CultureInfo.InvariantCulture);
        var start = new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);
        return (start, end);
    }
}
