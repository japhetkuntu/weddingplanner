namespace Ovutor.Admin.Api.Models.Responses;

public record AdminUserResponse(Guid Id, string Name, string Email, string Role);

public record LoginResponse(string AccessToken, string RefreshToken, AdminUserResponse User);

/// <summary>DevResetLink is only populated when there's no real email provider wired up (see backend
/// scope note) — a real deployment would omit this and only send the email.</summary>
public record ForgotPasswordResponse(string Message, string? DevResetLink);
