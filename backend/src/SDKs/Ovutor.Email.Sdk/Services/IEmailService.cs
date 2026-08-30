using Ovutor.Email.Sdk.Models;

namespace Ovutor.Email.Sdk.Services;

public interface IEmailService
{
    /// <summary>Renders <paramref name="templateId"/>.html (from the SDK's template directory,
    /// substituting {{key}} placeholders from <paramref name="variables"/>) and sends it via Mailtrap
    /// to every recipient in <paramref name="to"/>. Returns a Skipped result instead of throwing when
    /// no Mailtrap API key is configured — see <see cref="Options.MailtrapConfig.ApiKey"/>.</summary>
    Task<EmailResult> SendAsync(
        List<EmailContact> to,
        string subject,
        string templateId,
        Dictionary<string, string> variables,
        CancellationToken ct = default);
}
