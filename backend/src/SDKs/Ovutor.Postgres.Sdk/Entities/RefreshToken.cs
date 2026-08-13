namespace Ovutor.Postgres.Sdk.Entities;

public enum TokenOwnerType
{
    Admin,
    Client,
}

/// <summary>Backs JWT refresh-token rotation for both APIs. Stored in Postgres instead of Redis —
/// same rotate/revoke behavior, one less service to run for a 2-API backend.</summary>
public class RefreshToken : BaseEntity
{
    public TokenOwnerType OwnerType { get; set; }
    public Guid OwnerId { get; set; }
    public required string TokenHash { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }

    public bool IsActive => RevokedAtUtc is null && ExpiresAtUtc > DateTime.UtcNow;
}
