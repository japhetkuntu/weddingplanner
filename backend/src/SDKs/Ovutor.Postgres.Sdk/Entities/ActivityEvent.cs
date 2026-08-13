namespace Ovutor.Postgres.Sdk.Entities;

public class ActivityEvent : BaseEntity
{
    public Guid? ClientId { get; set; }
    public Client? Client { get; set; }
    public required string Message { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
}

public class MilestoneItem : BaseEntity
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public required string Title { get; set; }
    public DateOnly DueDate { get; set; }
    public required string Tag { get; set; }
}
