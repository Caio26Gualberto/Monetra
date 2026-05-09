using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class RefreshTokenRepository : Repository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(MonetraDbContext db) : base(db) { }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default)
        => await Db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token, ct);

    public async Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await Db.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAt == null && r.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(ct);

    public async Task RevokeAllForUserAsync(Guid userId, string reason, CancellationToken ct = default)
    {
        var active = await Db.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAt == null)
            .ToListAsync(ct);
        foreach (var t in active)
            t.Revoke(reason: reason);
        await Db.SaveChangesAsync(ct);
    }
}
