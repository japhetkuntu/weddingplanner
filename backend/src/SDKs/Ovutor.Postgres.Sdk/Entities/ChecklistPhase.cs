namespace Ovutor.Postgres.Sdk.Entities;

public class ChecklistPhase : BaseEntity
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public int Order { get; set; }

    public List<ChecklistTask> Tasks { get; set; } = [];
}

public class ChecklistTask : BaseEntity
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public Guid PhaseId { get; set; }
    public ChecklistPhase? Phase { get; set; }
    public required string Title { get; set; }

    /// <summary>"done" | "open" | "blocked"</summary>
    public required string Status { get; set; }

    public DateOnly? DueDate { get; set; }

    /// <summary>"at-risk" | "due-soon" | "waiting" | null</summary>
    public string? Priority { get; set; }

    public string? Note { get; set; }
}
