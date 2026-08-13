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
    public string? Description { get; set; }
    public decimal Planned { get; set; }
    public decimal Agreed { get; set; }
    public decimal Paid { get; set; }
    public DateOnly? NextDue { get; set; }
}
