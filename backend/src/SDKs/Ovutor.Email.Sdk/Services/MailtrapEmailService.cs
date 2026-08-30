using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Ovutor.Email.Sdk.Models;
using Ovutor.Email.Sdk.Options;

namespace Ovutor.Email.Sdk.Services;

/// <summary>Sends transactional email via Mailtrap's Send API. Templates are rendered locally from the
/// .html files in <see cref="MailtrapConfig.TemplateDirectory"/> using a plain {{variable}} placeholder
/// mechanism, so every template lives in source control and can be edited like any other file — no
/// separate dashboard step. Ovutor is single-brand, so unlike a multi-tenant SDK this doesn't need to
/// derive a color palette per send; the brand colors are just baked into each template's CSS.</summary>
public class MailtrapEmailService(
    IOptions<MailtrapConfig> options,
    IHttpClientFactory httpClientFactory,
    ILogger<MailtrapEmailService> logger) : IEmailService
{
    private readonly MailtrapConfig config = options.Value;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<EmailResult> SendAsync(
        List<EmailContact> to,
        string subject,
        string templateId,
        Dictionary<string, string> variables,
        CancellationToken ct = default)
    {
        var recipients = string.Join(", ", to.Select(t => t.Email));

        if (string.IsNullOrWhiteSpace(config.ApiKey))
        {
            logger.LogInformation(
                "[MailtrapEmailService] No Mailtrap API key configured — skipping send to {Recipients} (template: {Template}, subject: {Subject})",
                recipients, templateId, subject);
            return EmailResult.SkippedNoProvider("No Mailtrap API key configured.");
        }

        try
        {
            var html = await RenderHtmlAsync(templateId, variables);

            var payload = new MailtrapSendPayload(
                new MailtrapAddress(config.SenderEmail, config.SenderName),
                to.Select(t => new MailtrapAddress(t.Email, string.IsNullOrWhiteSpace(t.Name) ? t.Email : t.Name)).ToList(),
                subject,
                html,
                templateId);

            var client = httpClientFactory.CreateClient("Mailtrap");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", config.ApiKey);

            var response = await client.PostAsJsonAsync($"{config.BaseUrl}/api/send", payload, JsonOptions, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError(
                    "[MailtrapEmailService] Send failed ({Status}) to {Recipients} (template: {Template}): {Body}",
                    response.StatusCode, recipients, templateId, body);
                return EmailResult.Failed(body);
            }

            var parsed = JsonSerializer.Deserialize<MailtrapSendMessageResponse>(body, JsonOptions);
            var messageId = parsed?.MessageIds?.FirstOrDefault();
            logger.LogInformation("[MailtrapEmailService] Sent to {Recipients} (template: {Template})", recipients, templateId);
            return EmailResult.Success(messageId);
        }
        catch (Exception e)
        {
            logger.LogError(e, "[MailtrapEmailService] Failed to send to {Recipients} (template: {Template})", recipients, templateId);
            return EmailResult.Failed(e.Message);
        }
    }

    private async Task<string> RenderHtmlAsync(string templateId, Dictionary<string, string> variables)
    {
        var templatePath = GetTemplatePath(templateId);
        if (templatePath is not null)
        {
            var templateText = await File.ReadAllTextAsync(templatePath);
            return ReplaceVariables(templateText, variables);
        }

        logger.LogWarning("[MailtrapEmailService] No template file found for '{TemplateId}' in {Directory}; using fallback layout", templateId, config.TemplateDirectory);
        return BuildFallbackHtml(templateId, variables);
    }

    private string? GetTemplatePath(string templateId)
    {
        var candidate = Path.Combine(config.TemplateDirectory, $"{templateId}.html");
        if (File.Exists(candidate)) return candidate;

        var baseCandidate = Path.Combine(AppContext.BaseDirectory, config.TemplateDirectory, $"{templateId}.html");
        return File.Exists(baseCandidate) ? baseCandidate : null;
    }

    private static string ReplaceVariables(string templateText, Dictionary<string, string> variables)
    {
        foreach (var (key, value) in variables)
            templateText = templateText.Replace($"{{{{{key}}}}}", Sanitize(value), StringComparison.OrdinalIgnoreCase);
        return templateText;
    }

    private static string BuildFallbackHtml(string templateId, Dictionary<string, string> variables)
    {
        var rows = string.Join("", variables.Select(kv =>
            $"<tr><td style=\"padding:4px 0;color:#67615e;font-weight:700\">{Sanitize(kv.Key)}</td><td style=\"padding:4px 0 4px 16px\">{Sanitize(kv.Value)}</td></tr>"));

        return $"""
            <!doctype html><html><body style="margin:0;padding:32px;background:#FAF9F8;font-family:Arial,sans-serif;color:#1E1E1E">
            <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #ddd;padding:24px">
            <p style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#C1281B">Ovutor</p>
            <p style="color:#8a847f;font-size:12px">Template "{Sanitize(templateId)}" was missing on disk — showing a generic fallback layout.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">{rows}</table>
            </div></body></html>
            """;
    }

    private static string Sanitize(string input) =>
        input.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;");

    private record MailtrapAddress([property: JsonPropertyName("email")] string Email, [property: JsonPropertyName("name")] string Name);

    private record MailtrapSendPayload(
        [property: JsonPropertyName("from")] MailtrapAddress From,
        [property: JsonPropertyName("to")] List<MailtrapAddress> To,
        [property: JsonPropertyName("subject")] string Subject,
        [property: JsonPropertyName("html")] string Html,
        [property: JsonPropertyName("category")] string Category);

    private record MailtrapSendMessageResponse([property: JsonPropertyName("message_ids")] List<string>? MessageIds);
}
