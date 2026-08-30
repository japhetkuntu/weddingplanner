namespace Ovutor.Email.Sdk.Options;

public class MailtrapConfig
{
    public const string SectionName = "Mailtrap";

    public string BaseUrl { get; set; } = "https://send.api.mailtrap.io";

    /// <summary>Left empty in Development by default — <see cref="Services.MailtrapEmailService"/> skips
    /// the actual HTTP call and just logs what would have been sent whenever this is blank, the same
    /// "log instead of send" fallback already used for password-reset links. Set a real key (and a
    /// sender address verified in the Mailtrap account) to start sending for real.</summary>
    public string ApiKey { get; set; } = string.Empty;

    public string SenderEmail { get; set; } = "hello@ovutor.com";
    public string SenderName { get; set; } = "Ovutor";

    /// <summary>Directory (relative to the app's content root, or absolute) holding the .html templates.</summary>
    public string TemplateDirectory { get; set; } = "Templates";
}
