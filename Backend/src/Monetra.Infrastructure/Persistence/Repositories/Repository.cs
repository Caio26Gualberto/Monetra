using Microsoft.EntityFrameworkCore;
using Monetra.Domain.Repositories;

namespace Monetra.Infrastructure.Persistence.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly MonetraDbContext Db;

    public Repository(MonetraDbContext db) => Db = db;

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await Db.Set<T>().FindAsync(new object?[] { id }, ct);

    public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default)
        => await Db.Set<T>().ToListAsync(ct);

    public virtual async Task AddAsync(T entity, CancellationToken ct = default)
    {
        await Db.Set<T>().AddAsync(entity, ct);
        await Db.SaveChangesAsync(ct);
    }

    public virtual async Task UpdateAsync(T entity, CancellationToken ct = default)
    {
        Db.Set<T>().Update(entity);
        await Db.SaveChangesAsync(ct);
    }

    public virtual async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await GetByIdAsync(id, ct);
        if (entity is null) return;
        Db.Set<T>().Remove(entity);
        await Db.SaveChangesAsync(ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default) => Db.SaveChangesAsync(ct);
}
