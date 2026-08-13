namespace Ovutor.Client.Api.Models.Requests;

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);
