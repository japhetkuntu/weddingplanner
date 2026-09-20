using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IClientService
{
    Task<IApiResponse<List<ClientResponse>>> GetAllAsync(Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> GetByIdAsync(Guid id, Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<ClientWithCredentialsResponse>> CreateAsync(CreateClientRequest request, Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteAsync(Guid id, Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<object>> NotifyCoupleAsync(Guid id, Guid requestingAdminId, NotifyCoupleRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> UpdatePortalEmailAsync(Guid id, UpdatePortalEmailRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> UpdateFullPaymentDueDateAsync(Guid id, UpdateFullPaymentDueDateRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientCredentialsResponse>> ResetPortalPasswordAsync(Guid id, ResetPortalPasswordRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> ArchiveAsync(Guid id, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> UnarchiveAsync(Guid id, CancellationToken ct = default);
}
