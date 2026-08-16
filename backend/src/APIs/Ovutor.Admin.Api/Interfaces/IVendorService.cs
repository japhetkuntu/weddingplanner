using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IVendorService
{
    Task<IApiResponse<List<VendorResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<IApiResponse<VendorResponse>> AddAsync(CreateVendorRequest request, CancellationToken ct = default);
    Task<IApiResponse<VendorResponse>> UpdateAsync(Guid vendorId, UpdateVendorRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteAsync(Guid vendorId, CancellationToken ct = default);
}
