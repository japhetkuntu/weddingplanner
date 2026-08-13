namespace Ovutor.Postgres.Sdk.Entities;

public class RsvpGuest : BaseEntity
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public required string Household { get; set; }

    /// <summary>"attending" | "declined" | "awaiting"</summary>
    public required string Status { get; set; }

    public int? AttendanceCount { get; set; }
    public string? Dietary { get; set; }
    public string? PlannerNote { get; set; }
    public DateTime? RespondedAtUtc { get; set; }
}
