namespace Ovutor.Admin.Api.Models.Requests;

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Token, string NewPassword);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

/// <summary>Email is intentionally absent — it's the admin's login identifier, so it's never
/// self-service editable from the profile form (a Super Admin can still change it via Team management
/// if one is ever needed there).</summary>
public record UpdateProfileRequest(string Name);
