using Monetra.Domain.Entities;

namespace Monetra.Domain.Repositories;

public interface IAccountRepository : IRepository<Account>
{
    Task<Account?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<AccountBalanceHistory>> GetHistoryAsync(Guid accountId, CancellationToken ct = default);
    Task AddHistoryAsync(AccountBalanceHistory history, CancellationToken ct = default);
}
