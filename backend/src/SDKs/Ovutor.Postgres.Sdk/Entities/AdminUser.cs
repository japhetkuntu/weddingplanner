namespace Ovutor.Postgres.Sdk.Entities;

public class AdminUser : BaseEntity
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string Role { get; set; } = "Lead Planner";

    /// <summary>Set by /forgot-password, cleared once used. No email provider is wired up (see backend
    /// scope note), so in Development the reset link is returned directly in the API response instead
    /// of being emailed — same flow, just logged instead of sent.</summary>
    public string? PasswordResetTokenHash { get; set; }
    public DateTime? PasswordResetExpiresAtUtc { get; set; }
}
