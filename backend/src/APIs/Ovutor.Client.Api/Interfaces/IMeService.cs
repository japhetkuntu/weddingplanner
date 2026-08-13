using Ovutor.Client.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Client.Api.Interfaces;

public interface IMeService
{
    Task<IApiResponse<ProfileResponse>> GetProfileAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<ChecklistResponse>> GetChecklistAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<BudgetResponse>> GetBudgetAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<List<RsvpGuestResponse>>> GetRsvpsAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<List<DocumentFileResponse>>> GetDocumentsAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<WebsiteStatusResponse>> GetWebsiteStatusAsync(Guid clientId, CancellationToken ct = default);
    Task<IApiResponse<DashboardResponse>> GetDashboardAsync(Guid clientId, CancellationToken ct = default);
}
