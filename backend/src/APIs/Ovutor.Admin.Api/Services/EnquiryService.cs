using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Email.Sdk.Models;
using Ovutor.Email.Sdk.Services;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class EnquiryService(
    IRepository<MarketingEnquiry> enquiries,
    IRepository<AdminUser> adminUsers,
    IEmailService emailService,
    ILogger<EnquiryService> logger) : IEnquiryService
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

    public async Task<IApiResponse<object>> ReplyAsync(Guid id, Guid adminId, ReplyToEnquiryRequest request, CancellationToken ct = default)
    {
        try
        {
            var subject = request.Subject?.Trim();
            var message = request.Message?.Trim();
            if (string.IsNullOrEmpty(subject)) return ApiResponseFactory.BadRequest<object>("Add a subject.");
            if (string.IsNullOrEmpty(message)) return ApiResponseFactory.BadRequest<object>("Write your reply first.");

            var enquiry = await enquiries.GetByIdAsync(id, ct) ?? throw new NotFoundException("We couldn't find that enquiry.");
            var sender = await adminUsers.GetByIdAsync(adminId, ct);

            var result = await emailService.SendAsync(
                to: [new EmailContact(enquiry.Email, enquiry.Name)],
                subject: subject,
                templateId: "enquiry-reply",
                variables: new Dictionary<string, string>
                {
                    ["recipient_name"] = enquiry.Name,
                    ["message"] = message,
                    ["sender_name"] = sender?.Name ?? "The Ovutor team",
                },
                ct: ct);

            if (result.Skipped)
                return ApiResponseFactory.BadRequest<object>("Email sending isn't set up yet — add the Mailtrap API key on the server, then try again.");
            if (!result.Sent)
                return ApiResponseFactory.BadRequest<object>("The email couldn't be sent. Please try again in a moment.");

            enquiry.IsRead = true;
            await enquiries.UpdateAsync(enquiry, ct);
            return new object().ToOkApiResponse($"Reply sent to {enquiry.Email}.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[ReplyAsync] Failed to reply to enquiry {EnquiryId}", id);
            return ApiResponseFactory.InternalError<object>("Failed to send the reply.");
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
        e.CreatedAtUtc.ToString("yyyy-MM-ddTHH:mm:ssZ"), e.IsRead,
        e.GroomName, e.ContactingFrom, e.IsIntimate, e.WantsConsultation, e.ConsultationAt);
}
