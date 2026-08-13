using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Persistence;

namespace Ovutor.Postgres.Sdk.Repositories;

public class EfRepository<TEntity>(OvutorDbContext db) : IRepository<TEntity> where TEntity : BaseEntity
{
    private DbSet<TEntity> Set => db.Set<TEntity>();

    public Task<TEntity?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        Set.FirstOrDefaultAsync(e => e.Id == id, ct);

    public Task<TEntity?> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default) =>
        Set.FirstOrDefaultAsync(predicate, ct);

    public async Task<IReadOnlyList<TEntity>> FindManyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default) =>
        await Set.Where(predicate).ToListAsync(ct);

    public Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default) =>
        Set.AnyAsync(predicate, ct);

    public async Task<PagedResult<TEntity>> GetPagedAsync(
        int pageIndex,
        int pageSize,
        Expression<Func<TEntity, bool>>? filter = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        CancellationToken ct = default)
    {
        IQueryable<TEntity> query = Set;
        if (filter is not null) query = query.Where(filter);

        var totalCount = await query.CountAsync(ct);
        if (orderBy is not null) query = orderBy(query);

        var items = await query.Skip(pageIndex * pageSize).Take(pageSize).ToListAsync(ct);

        return new PagedResult<TEntity>
        {
            Items = items,
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    public IQueryable<TEntity> GetQueryable() => Set;

    public async Task AddAsync(TEntity entity, CancellationToken ct = default)
    {
        await Set.AddAsync(entity, ct);
        await db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(TEntity entity, CancellationToken ct = default)
    {
        Set.Update(entity);
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveAsync(TEntity entity, CancellationToken ct = default)
    {
        entity.IsDeleted = true;
        Set.Update(entity);
        await db.SaveChangesAsync(ct);
    }
}
