using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Entities;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(MonetraDbContext db) : base(db) { }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await Db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower(), ct);

    public async Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
        => await Db.Users.AnyAsync(u => u.Email == email.ToLower(), ct);
}
