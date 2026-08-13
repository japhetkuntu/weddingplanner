using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IDashboardService
{
    Task<IApiResponse<DashboardResponse>> GetAsync(CancellationToken ct = default);
    Task<IApiResponse<ClientActivityResponse>> GetForClientAsync(Guid clientId, CancellationToken ct = default);
}
