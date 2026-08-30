using Microsoft.AspNetCore.Http;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IVendorService
{
    Task<IApiResponse<List<VendorResponse>>> GetAllAsync(Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<VendorResponse>> AddAsync(CreateVendorRequest request, Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<VendorResponse>> UpdateAsync(Guid vendorId, UpdateVendorRequest request, Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<VendorResponse>> UploadPhotoAsync(Guid vendorId, IFormFile file, Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<VendorResponse>> UploadContractAsync(Guid vendorId, IFormFile file, Guid requestingAdminId, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteAsync(Guid vendorId, Guid requestingAdminId, CancellationToken ct = default);
}
