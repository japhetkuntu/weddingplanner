namespace Ovutor.Postgres.Sdk.Entities;

public class BudgetCategory : BaseEntity
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }

    public List<BudgetExpense> Expenses { get; set; } = [];
}

public class BudgetExpense : BaseEntity
{
    public Guid CategoryId { get; set; }
    public BudgetCategory? Category { get; set; }
    public required string Vendor { get; set; }
    /// <summary>Optional link to a directory Vendor — when set, <see cref="Vendor"/> is kept in sync
    /// with the linked vendor's name so list views never need a join.</summary>
    public Guid? VendorId { get; set; }
    public string? Description { get; set; }
    public decimal Estimated { get; set; }
    public decimal Actual { get; set; }
    public decimal Paid { get; set; }
    public DateOnly? NextDue { get; set; }
}
