using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Responses;

namespace Ovutor.Admin.Api.Interfaces;

public interface IEnquiryService
{
    Task<IApiResponse<List<EnquiryResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<IApiResponse<EnquiryResponse>> SetReadAsync(Guid id, SetEnquiryReadRequest request, CancellationToken ct = default);
    Task<IApiResponse<object>> DeleteAsync(Guid id, CancellationToken ct = default);
}
