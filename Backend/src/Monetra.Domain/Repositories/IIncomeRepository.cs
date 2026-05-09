using Monetra.Domain.Entities;
using Monetra.Domain.Enums;

namespace Monetra.Domain.Repositories;

public interface IIncomeRepository : IRepository<Income>
{
    Task<IEnumerable<Income>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<Income>> GetByMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task<IEnumerable<Income>> GetByTypeAsync(Guid userId, IncomeType type, CancellationToken ct = default);
    Task<decimal> GetTotalByMonthAsync(Guid userId, string month, CancellationToken ct = default);
    Task<decimal> GetTotalByMonthAndTypeAsync(Guid userId, string month, IncomeType type, CancellationToken ct = default);
}
