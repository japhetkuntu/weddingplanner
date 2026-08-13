using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Services;

public class RsvpService(IRepository<RsvpGuest> rsvps, ILogger<RsvpService> logger) : IRsvpService
{
    public async Task<IApiResponse<List<RsvpGuestResponse>>> GetForClientAsync(Guid clientId, CancellationToken ct = default)
    {
        try
        {
            var list = await rsvps.GetQueryable().Where(r => r.ClientId == clientId).ToListAsync(ct);
            return list.Select(ToResponse).ToList().ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetForClientAsync] Failed to load RSVPs for {ClientId}", clientId);
            return ApiResponseFactory.InternalError<List<RsvpGuestResponse>>("Failed to load RSVPs.");
        }
    }

    public async Task<IApiResponse<RsvpGuestResponse>> UpdateAsync(Guid rsvpId, UpdateRsvpRequest request, CancellationToken ct = default)
    {
        try
        {
            var rsvp = await rsvps.GetByIdAsync(rsvpId, ct) ?? throw new NotFoundException("We couldn't find that guest.");
            var wasAwaiting = rsvp.Status == "awaiting";
            rsvp.Status = request.Status;
            rsvp.AttendanceCount = request.AttendanceCount;
            rsvp.Dietary = request.Dietary;
            rsvp.PlannerNote = request.PlannerNote;
            if (wasAwaiting && request.Status != "awaiting") rsvp.RespondedAtUtc = DateTime.UtcNow;
            await rsvps.UpdateAsync(rsvp, ct);
            return ToResponse(rsvp).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateAsync] Failed to update RSVP {RsvpId}", rsvpId);
            return ApiResponseFactory.InternalError<RsvpGuestResponse>("Failed to save RSVP.");
        }
    }

    private static RsvpGuestResponse ToResponse(RsvpGuest r) => new(
        r.Id, r.ClientId, r.Household, r.Status, r.AttendanceCount, r.Dietary, r.PlannerNote,
        r.RespondedAtUtc?.ToString("yyyy-MM-dd"));
}
