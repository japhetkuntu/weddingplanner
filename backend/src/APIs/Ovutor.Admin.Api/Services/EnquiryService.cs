using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class EnquiryService(IRepository<MarketingEnquiry> enquiries, ILogger<EnquiryService> logger) : IEnquiryService
{
    public async Task<IApiResponse<List<EnquiryResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        try
        {
            var list = await enquiries.GetQueryable().OrderByDescending(e => e.CreatedAtUtc).ToListAsync(ct);
            return list.Select(ToResponse).ToList().ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetAllAsync] Failed to load enquiries");
            return ApiResponseFactory.InternalError<List<EnquiryResponse>>("Failed to load enquiries.");
        }
    }

    public async Task<IApiResponse<EnquiryResponse>> SetReadAsync(Guid id, SetEnquiryReadRequest request, CancellationToken ct = default)
    {
        try
        {
            var enquiry = await enquiries.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that enquiry.");
            enquiry.IsRead = request.IsRead;
            await enquiries.UpdateAsync(enquiry, ct);
            return ToResponse(enquiry).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[SetReadAsync] Failed to update enquiry {EnquiryId}", id);
            return ApiResponseFactory.InternalError<EnquiryResponse>("Failed to save.");
        }
    }

    public async Task<IApiResponse<object>> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var enquiry = await enquiries.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that enquiry.");
            await enquiries.RemoveAsync(enquiry, ct);
            return new object().ToOkApiResponse("Enquiry deleted.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[DeleteAsync] Failed to delete enquiry {EnquiryId}", id);
            return ApiResponseFactory.InternalError<object>("Failed to delete enquiry.");
        }
    }

    private static EnquiryResponse ToResponse(MarketingEnquiry e) => new(
        e.Id, e.Name, e.Email, e.WeddingDate, e.Location, e.GuestCount, e.Budget, e.Message,
        e.CreatedAtUtc.ToString("yyyy-MM-ddTHH:mm:ssZ"), e.IsRead);
}
