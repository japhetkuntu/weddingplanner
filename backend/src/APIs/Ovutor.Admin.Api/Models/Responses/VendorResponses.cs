namespace Ovutor.Admin.Api.Models.Responses;

public record VendorResponse(
    Guid Id,
    string Name,
    string? Contact,
    string Location,
    string? Category,
    string? Summary,
    string? PhotoUrl,
    string? ContractUrl,
    string? ContractFileName,
    bool CanManage);
