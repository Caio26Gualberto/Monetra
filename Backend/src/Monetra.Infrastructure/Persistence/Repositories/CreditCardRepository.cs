using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class CreditCardRepository : Repository<CreditCard>, ICreditCardRepository
{
    public CreditCardRepository(MonetraDbContext db) : base(db) { }

    public async Task<IEnumerable<CreditCard>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await Db.CreditCards.Where(c => c.UserId == userId).OrderBy(c => c.CardName).ToListAsync(ct);
}

public class CreditCardPurchaseRepository : Repository<CreditCardPurchase>, ICreditCardPurchaseRepository
{
    public CreditCardPurchaseRepository(MonetraDbContext db) : base(db) { }

    public async Task<IEnumerable<CreditCardPurchase>> GetByCreditCardIdAsync(Guid creditCardId, CancellationToken ct = default)
        => await Db.CreditCardPurchases.Where(p => p.CreditCardId == creditCardId)
            .OrderByDescending(p => p.PurchaseDate).ToListAsync(ct);

    public async Task<IEnumerable<CreditCardPurchase>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var query = from p in Db.CreditCardPurchases
                    join c in Db.CreditCards on p.CreditCardId equals c.Id
                    where c.UserId == userId
                    orderby p.PurchaseDate descending
                    select p;
        return await query.ToListAsync(ct);
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
}

public class CreditCardInvoicePaymentRepository : Repository<CreditCardInvoicePayment>, ICreditCardInvoicePaymentRepository
{
    public CreditCardInvoicePaymentRepository(MonetraDbContext db) : base(db) { }

    public async Task<CreditCardInvoicePayment?> GetAsync(Guid creditCardId, string month, CancellationToken ct = default)
        => await Db.CreditCardInvoicePayments
            .FirstOrDefaultAsync(p => p.CreditCardId == creditCardId && p.Month == month, ct);

    public async Task<IEnumerable<CreditCardInvoicePayment>> GetByCardAsync(Guid creditCardId, CancellationToken ct = default)
        => await Db.CreditCardInvoicePayments.Where(p => p.CreditCardId == creditCardId)
            .OrderByDescending(p => p.Month).ToListAsync(ct);

    public async Task<IEnumerable<CreditCardInvoicePayment>> GetByUserAsync(Guid userId, CancellationToken ct = default)
    {
        var q = from p in Db.CreditCardInvoicePayments
                join c in Db.CreditCards on p.CreditCardId equals c.Id
                where c.UserId == userId
                orderby p.Month descending
                select p;
        return await q.ToListAsync(ct);
    }

    public async Task DeleteAsync(Guid creditCardId, string month, CancellationToken ct = default)
    {
        var entity = await GetAsync(creditCardId, month, ct);
        if (entity == null) return;
        Db.CreditCardInvoicePayments.Remove(entity);
        await Db.SaveChangesAsync(ct);
    }
}
