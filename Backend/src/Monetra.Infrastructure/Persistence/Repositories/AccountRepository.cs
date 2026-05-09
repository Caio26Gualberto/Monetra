using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class AccountRepository : Repository<Account>, IAccountRepository
{
    public AccountRepository(MonetraDbContext db) : base(db) { }

    public async Task<Account?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await Db.Accounts.FirstOrDefaultAsync(a => a.UserId == userId, ct);

    public async Task<IEnumerable<AccountBalanceHistory>> GetHistoryAsync(Guid accountId, CancellationToken ct = default)
        => await Db.AccountBalanceHistories
            .Where(h => h.AccountId == accountId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(ct);

    public async Task AddHistoryAsync(AccountBalanceHistory history, CancellationToken ct = default)
    {
        await Db.AccountBalanceHistories.AddAsync(history, ct);
        await Db.SaveChangesAsync(ct);
    }
}
