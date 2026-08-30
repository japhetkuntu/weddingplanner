namespace Ovutor.Postgres.Sdk.Entities;

/// <summary>A shared directory entry, not scoped to any one client — the same florist or venue often
/// serves multiple couples, so budget expenses link to this by <see cref="BudgetExpense.VendorId"/>
/// instead of each client keeping its own copy.</summary>
public class Vendor : BaseEntity
{
    public required string Name { get; set; }
    public string? Contact { get; set; }
    public required string Location { get; set; }

    /// <summary>e.g. "Florist", "Photographer", "Caterer" — shown as a badge on the vendor card.</summary>
    public string? Category { get; set; }
    /// <summary>Short description of what they provide, shown on the card.</summary>
    public string? Summary { get; set; }
    public string? PhotoStoragePath { get; set; }

    public string? ContractStoragePath { get; set; }
    public string? ContractFileName { get; set; }
    public string? ContractContentType { get; set; }

    /// <summary>The admin who added this vendor. A Super Admin can manage every vendor; anyone else
    /// can only manage the ones they added themselves. Null means no one but a Super Admin can manage
    /// it — the state a vendor falls back to if its creator's account is ever removed.</summary>
    public Guid? CreatedByAdminId { get; set; }
    public AdminUser? CreatedByAdmin { get; set; }
}
