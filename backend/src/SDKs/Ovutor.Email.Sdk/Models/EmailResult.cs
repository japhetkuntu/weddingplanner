namespace Ovutor.Email.Sdk.Models;

/// <summary><see cref="Skipped"/> distinguishes "no provider configured yet" (expected in Development,
/// not worth alarming anyone about) from an actual delivery failure worth surfacing.</summary>
public record EmailResult(bool Sent, bool Skipped, string? MessageId, string? Error)
{
    public static EmailResult Success(string? messageId) => new(true, false, messageId, null);
    public static EmailResult SkippedNoProvider(string reason) => new(false, true, null, reason);
    public static EmailResult Failed(string error) => new(false, false, null, error);
}
