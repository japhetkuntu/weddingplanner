namespace Ovutor.Admin.Api.Models.Requests;

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Token, string NewPassword);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record UpdateProfileRequest(string Name, string Email);
