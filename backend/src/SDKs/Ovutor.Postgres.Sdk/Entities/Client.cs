namespace Ovutor.Postgres.Sdk.Entities;

/// <summary>The couple/CRM record — also doubles as the Client Portal login (PortalEmail/PortalPasswordHash),
/// exactly like the frontend mock modeled it: the admin creates and resets this couple's portal
/// credentials, the couple never self-registers.</summary>
public class Client : BaseEntity
{
    /// <summary>URL-safe identifier used for both the Client Portal reference and the public wedding
    /// website route (ovutor.com/{slug}).</summary>
    public required string Slug { get; set; }

    public required string CoupleNames { get; set; }
    public required string PartnerA { get; set; }
    public required string PartnerB { get; set; }
    public DateOnly WeddingDate { get; set; }
    public required string Venue { get; set; }
    public int GuestCount { get; set; }

    /// <summary>"on-track" | "attention" | "early-planning" — kept as the literal frontend string so no
    /// enum/string translation layer is needed on either side.</summary>
    public required string Status { get; set; }

    public int PlanningPercent { get; set; }
    public decimal BudgetTotal { get; set; }
    public decimal BudgetPaid { get; set; }
    public required string Currency { get; set; }
    public required string NextAttention { get; set; }
    public required string AvatarInitials { get; set; }

    public required string PortalEmail { get; set; }
    public required string PortalPasswordHash { get; set; }

    public List<ChecklistPhase> ChecklistPhases { get; set; } = [];
    public List<BudgetCategory> BudgetCategories { get; set; } = [];
    public List<RsvpGuest> RsvpGuests { get; set; } = [];
    public List<DocumentFile> Documents { get; set; } = [];
    public List<ActivityEvent> ActivityEvents { get; set; } = [];
    public List<MilestoneItem> Milestones { get; set; } = [];
    public List<WebsiteSection> WebsiteSections { get; set; } = [];
    public WebsiteContent? WebsiteContent { get; set; }
}
