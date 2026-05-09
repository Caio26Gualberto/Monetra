using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class CreditCardRepository : Repository<CreditCard>, ICreditCardRepository
{
    public CreditCardRepository(MonetraDbContext db) : base(db) { }

    public async Task<IEnumerable<CreditCard>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await Db.CreditCards.Where(c => c.UserId == userId).OrderBy(c => c.CardName).ToListAsync(ct);

    public async Task<IEnumerable<CreditCard>> GetByMonthAsync(Guid userId, string month, CancellationToken ct = default)
        => await Db.CreditCards.Where(c => c.UserId == userId && c.Month == month)
            .OrderBy(c => c.CardName).ToListAsync(ct);
}

public class CreditCardPurchaseRepository : Repository<CreditCardPurchase>, ICreditCardPurchaseRepository
{
    public CreditCardPurchaseRepository(MonetraDbContext db) : base(db) { }

    public async Task<IEnumerable<CreditCardPurchase>> GetByCreditCardIdAsync(Guid creditCardId, CancellationToken ct = default)
        => await Db.CreditCardPurchases.Where(p => p.CreditCardId == creditCardId)
            .OrderByDescending(p => p.PurchaseDate).ToListAsync(ct);

    public async Task<IEnumerable<CreditCardPurchase>> GetByCreditCardAndMonthAsync(Guid creditCardId, string month, CancellationToken ct = default)
    {
        var (s, e) = MonthRange(month);
        return await Db.CreditCardPurchases
            .Where(p => p.CreditCardId == creditCardId && p.PurchaseDate >= s && p.PurchaseDate < e)
            .OrderByDescending(p => p.PurchaseDate)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<CreditCardPurchase>> GetPendingInstallmentsByUserAsync(Guid userId, CancellationToken ct = default)
    {
        var query = from p in Db.CreditCardPurchases
                    join c in Db.CreditCards on p.CreditCardId equals c.Id
                    where c.UserId == userId && p.CurrentInstallment <= p.TotalInstallments
                    orderby p.PurchaseDate descending
                    select p;
        return await query.ToListAsync(ct);
    }

    private static (DateTime start, DateTime end) MonthRange(string month)
    {
        var dt = DateTime.ParseExact(month, "yyyy-MM", System.Globalization.CultureInfo.InvariantCulture);
        var start = new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        return (start, start.AddMonths(1));
    }
}
