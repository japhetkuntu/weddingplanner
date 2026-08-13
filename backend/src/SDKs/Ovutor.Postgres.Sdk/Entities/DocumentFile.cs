namespace Ovutor.Postgres.Sdk.Entities;

/// <summary>The growable category list documents are tagged with — admins add new ones on the fly
/// from the upload/edit form instead of picking from a fixed list.</summary>
public class DocumentCategory : BaseEntity
{
    public required string Name { get; set; }
}

public class DocumentFile : BaseEntity
{
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public required string Name { get; set; }
    public required string Uploader { get; set; }

    /// <summary>"client" | "planner-only"</summary>
    public required string Visibility { get; set; }

    public required string Category { get; set; }
    public required string SizeLabel { get; set; }
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;

    /// <summary>Path under the Admin API's wwwroot/uploads, e.g. "uploads/{clientId}/{fileName}" — served
    /// statically, standing in for a real object-storage URL.</summary>
    public string? StoragePath { get; set; }
    public string? ContentType { get; set; }
}
