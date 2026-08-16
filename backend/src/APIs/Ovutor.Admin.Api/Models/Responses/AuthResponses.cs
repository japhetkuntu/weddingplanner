namespace Ovutor.Admin.Api.Models.Responses;

public record AdminUserResponse(Guid Id, string Name, string Email, string Role);

/// <summary>The temporary password is only present in the response to the create call itself — same
/// one-time-reveal shape as the Client Portal credential flow in AddClientPage.tsx.</summary>
public record CreateAdminUserResponse(AdminUserResponse User, string TemporaryPassword);

public record LoginResponse(string AccessToken, string RefreshToken, AdminUserResponse User);

/// <summary>DevResetLink is only populated when there's no real email provider wired up (see backend
/// scope note) — a real deployment would omit this and only send the email.</summary>
public record ForgotPasswordResponse(string Message, string? DevResetLink);
