namespace Ovutor.Postgres.Sdk.Entities;

/// <summary>A shared directory entry, not scoped to any one client — the same florist or venue often
/// serves multiple couples, so budget expenses link to this by <see cref="BudgetExpense.VendorId"/>
/// instead of each client keeping its own copy.</summary>
public class Vendor : BaseEntity
{
    public required string Name { get; set; }
    public string? Contact { get; set; }
    public required string Location { get; set; }
}
