namespace Ovutor.Client.Api.Models.Responses;

public record ClientUserResponse(Guid Id, string CoupleNames, string PartnerA, string PartnerB, string PortalEmail);

public record LoginResponse(string AccessToken, string RefreshToken, ClientUserResponse User);
