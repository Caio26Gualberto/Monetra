using Monetra.Domain.Entities;

namespace Monetra.Domain.Repositories;

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default);
    Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task RevokeAllForUserAsync(Guid userId, string reason, CancellationToken ct = default);
}
