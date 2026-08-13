using Microsoft.EntityFrameworkCore;
using Ovutor.Postgres.Sdk.Entities;

namespace Ovutor.Postgres.Sdk.Persistence;

public class OvutorDbContext(DbContextOptions<OvutorDbContext> options) : DbContext(options)
{
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ChecklistPhase> ChecklistPhases => Set<ChecklistPhase>();
    public DbSet<ChecklistTask> ChecklistTasks => Set<ChecklistTask>();
    public DbSet<BudgetCategory> BudgetCategories => Set<BudgetCategory>();
    public DbSet<BudgetExpense> BudgetExpenses => Set<BudgetExpense>();
    public DbSet<RsvpGuest> RsvpGuests => Set<RsvpGuest>();
    public DbSet<DocumentCategory> DocumentCategories => Set<DocumentCategory>();
    public DbSet<DocumentFile> DocumentFiles => Set<DocumentFile>();
    public DbSet<ActivityEvent> ActivityEvents => Set<ActivityEvent>();
    public DbSet<MilestoneItem> Milestones => Set<MilestoneItem>();
    public DbSet<WebsiteSection> WebsiteSections => Set<WebsiteSection>();
    public DbSet<WebsiteContent> WebsiteContents => Set<WebsiteContent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(BaseEntity).IsAssignableFrom(entityType.ClrType)) continue;

            // Soft-delete: every query implicitly excludes IsDeleted rows, so RemoveAsync in the
            // repository can just flip the flag instead of a hard DELETE.
            var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
            var property = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
            var condition = System.Linq.Expressions.Expression.Equal(property, System.Linq.Expressions.Expression.Constant(false));
            var lambda = System.Linq.Expressions.Expression.Lambda(condition, parameter);
            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
        }

        modelBuilder.Entity<AdminUser>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Client>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasIndex(x => x.PortalEmail).IsUnique();
            e.Property(x => x.BudgetTotal).HasColumnType("numeric(14,2)");
            e.Property(x => x.BudgetPaid).HasColumnType("numeric(14,2)");
        });

        modelBuilder.Entity<ChecklistPhase>(e =>
        {
            e.HasOne(x => x.Client).WithMany(c => c.ChecklistPhases).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChecklistTask>(e =>
        {
            e.HasOne(x => x.Client).WithMany().HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Phase).WithMany(p => p.Tasks).HasForeignKey(x => x.PhaseId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BudgetCategory>(e =>
        {
            e.HasOne(x => x.Client).WithMany(c => c.BudgetCategories).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BudgetExpense>(e =>
        {
            e.HasOne(x => x.Category).WithMany(c => c.Expenses).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.Planned).HasColumnType("numeric(14,2)");
            e.Property(x => x.Agreed).HasColumnType("numeric(14,2)");
            e.Property(x => x.Paid).HasColumnType("numeric(14,2)");
        });

        modelBuilder.Entity<RsvpGuest>(e =>
        {
            e.HasOne(x => x.Client).WithMany(c => c.RsvpGuests).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DocumentCategory>(e =>
        {
            e.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<DocumentFile>(e =>
        {
            e.HasOne(x => x.Client).WithMany(c => c.Documents).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ActivityEvent>(e =>
        {
            e.HasOne(x => x.Client).WithMany(c => c.ActivityEvents).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MilestoneItem>(e =>
        {
            e.HasOne(x => x.Client).WithMany(c => c.Milestones).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WebsiteSection>(e =>
        {
            e.HasOne(x => x.Client).WithMany(c => c.WebsiteSections).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WebsiteContent>(e =>
        {
            e.HasIndex(x => x.ClientId).IsUnique();
            e.HasOne(x => x.Client).WithOne(c => c.WebsiteContent).HasForeignKey<WebsiteContent>(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);
            foreach (var col in new[] { nameof(WebsiteContent.HeroJson), nameof(WebsiteContent.OurStoryJson), nameof(WebsiteContent.DetailsJson), nameof(WebsiteContent.ScheduleJson), nameof(WebsiteContent.TravelJson), nameof(WebsiteContent.GalleryJson), nameof(WebsiteContent.RsvpJson) })
            {
                e.Property(col).HasColumnType("jsonb");
            }
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(x => x.TokenHash).IsUnique();
        });
    }

    public override int SaveChanges()
    {
        TouchTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        TouchTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void TouchTimestamps()
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified) entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
        }
    }
}
