using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IClientService
{
    Task<IApiResponse<List<ClientResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IApiResponse<ClientWithCredentialsResponse>> CreateAsync(CreateClientRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> UpdatePortalEmailAsync(Guid id, UpdatePortalEmailRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> UpdateFullPaymentDueDateAsync(Guid id, UpdateFullPaymentDueDateRequest request, CancellationToken ct = default);
    Task<IApiResponse<ClientCredentialsResponse>> ResetPortalPasswordAsync(Guid id, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> ArchiveAsync(Guid id, CancellationToken ct = default);
    Task<IApiResponse<ClientResponse>> UnarchiveAsync(Guid id, CancellationToken ct = default);
}
