using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Models.Requests;
using Ovutor.Admin.Api.Models.Responses;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Common.Sdk.Responses;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;
using Ovutor.Storage.Sdk;

namespace Ovutor.Admin.Api.Services;

public class VendorService(
    IRepository<Vendor> vendors,
    IRepository<AdminUser> adminUsers,
    IStorageService storageService,
    ILogger<VendorService> logger) : IVendorService
{
    private async Task<AdminUser> RequireAdminAsync(Guid requestingAdminId, CancellationToken ct) =>
        await adminUsers.GetByIdAsync(requestingAdminId, ct) ?? throw new UnauthorizedException();

    /// <summary>Only a Super Admin or the vendor's own creator can edit/delete/upload files for it —
    /// everyone else can still see it in the shared directory (vendors are booked across weddings),
    /// they just can't manage someone else's entry.</summary>
    private static bool CanManage(Vendor vendor, AdminUser requester) =>
        requester.IsSuperAdmin || vendor.CreatedByAdminId == requester.Id;

    public async Task<IApiResponse<List<VendorResponse>>> GetAllAsync(Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var requester = await RequireAdminAsync(requestingAdminId, ct);
            var list = await vendors.GetQueryable().OrderBy(v => v.Location).ThenBy(v => v.Name).ToListAsync(ct);
            return list.Select(v => ToResponse(v, requester)).ToList().ToOkApiResponse();
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[GetAllAsync] Failed to load vendors");
            return ApiResponseFactory.InternalError<List<VendorResponse>>("Failed to load vendors.");
        }
    }

    public async Task<IApiResponse<VendorResponse>> AddAsync(CreateVendorRequest request, Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var requester = await RequireAdminAsync(requestingAdminId, ct);
            var name = request.Name.Trim();
            var location = request.Location.Trim();
            if (string.IsNullOrEmpty(name)) return ApiResponseFactory.BadRequest<VendorResponse>("Give this vendor a name.");
            if (string.IsNullOrEmpty(location)) return ApiResponseFactory.BadRequest<VendorResponse>("Give this vendor a location.");

            var vendor = new Vendor
            {
                Name = name,
                Location = location,
                Contact = string.IsNullOrWhiteSpace(request.Contact) ? null : request.Contact.Trim(),
                Category = string.IsNullOrWhiteSpace(request.Category) ? null : request.Category.Trim(),
                Summary = string.IsNullOrWhiteSpace(request.Summary) ? null : request.Summary.Trim(),
                CreatedByAdminId = requestingAdminId,
            };
            await vendors.AddAsync(vendor, ct);
            return ToResponse(vendor, requester).ToCreatedApiResponse("Vendor added.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[AddAsync] Failed to add vendor");
            return ApiResponseFactory.InternalError<VendorResponse>("Failed to add vendor.");
        }
    }

    public async Task<IApiResponse<VendorResponse>> UpdateAsync(Guid vendorId, UpdateVendorRequest request, Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var requester = await RequireAdminAsync(requestingAdminId, ct);
            var vendor = await vendors.GetByIdAsync(vendorId, ct) ?? throw new NotFoundException("We couldn't find that vendor.");
            if (!CanManage(vendor, requester)) return ApiResponseFactory.Forbidden<VendorResponse>("Only a Super Admin or this vendor's creator can edit it.");

            vendor.Name = string.IsNullOrWhiteSpace(request.Name) ? vendor.Name : request.Name.Trim();
            vendor.Location = string.IsNullOrWhiteSpace(request.Location) ? vendor.Location : request.Location.Trim();
            vendor.Contact = string.IsNullOrWhiteSpace(request.Contact) ? null : request.Contact.Trim();
            vendor.Category = string.IsNullOrWhiteSpace(request.Category) ? null : request.Category.Trim();
            vendor.Summary = string.IsNullOrWhiteSpace(request.Summary) ? null : request.Summary.Trim();
            await vendors.UpdateAsync(vendor, ct);
            return ToResponse(vendor, requester).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateAsync] Failed to update vendor {VendorId}", vendorId);
            return ApiResponseFactory.InternalError<VendorResponse>("Failed to save vendor.");
        }
    }

    public async Task<IApiResponse<VendorResponse>> UploadPhotoAsync(Guid vendorId, IFormFile file, Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var requester = await RequireAdminAsync(requestingAdminId, ct);
            var vendor = await vendors.GetByIdAsync(vendorId, ct) ?? throw new NotFoundException("We couldn't find that vendor.");
            if (!CanManage(vendor, requester)) return ApiResponseFactory.Forbidden<VendorResponse>("Only a Super Admin or this vendor's creator can edit it.");
            if (file.Length == 0) throw new OvutorException("The selected file is empty.", 400);

            vendor.PhotoStoragePath = await storageService.UploadAsync(new UploadFileRequest
            {
                OpenContent = file.OpenReadStream,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                Folder = "vendors",
                OptimizeAsPhoto = true,
            }, ct);
            await vendors.UpdateAsync(vendor, ct);
            return ToResponse(vendor, requester).ToOkApiResponse("Photo uploaded.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UploadPhotoAsync] Failed to upload photo for vendor {VendorId}", vendorId);
            return ApiResponseFactory.InternalError<VendorResponse>("Failed to upload photo.");
        }
    }

    public async Task<IApiResponse<VendorResponse>> UploadContractAsync(Guid vendorId, IFormFile file, Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var requester = await RequireAdminAsync(requestingAdminId, ct);
            var vendor = await vendors.GetByIdAsync(vendorId, ct) ?? throw new NotFoundException("We couldn't find that vendor.");
            if (!CanManage(vendor, requester)) return ApiResponseFactory.Forbidden<VendorResponse>("Only a Super Admin or this vendor's creator can edit it.");
            if (file.Length == 0) throw new OvutorException("The selected file is empty.", 400);

            vendor.ContractStoragePath = await storageService.UploadAsync(new UploadFileRequest
            {
                OpenContent = file.OpenReadStream,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                Folder = "vendor-contracts",
            }, ct);
            vendor.ContractFileName = file.FileName;
            vendor.ContractContentType = file.ContentType;
            await vendors.UpdateAsync(vendor, ct);
            return ToResponse(vendor, requester).ToOkApiResponse("Contract uploaded.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UploadContractAsync] Failed to upload contract for vendor {VendorId}", vendorId);
            return ApiResponseFactory.InternalError<VendorResponse>("Failed to upload contract.");
        }
    }

    public async Task<IApiResponse<object>> DeleteAsync(Guid vendorId, Guid requestingAdminId, CancellationToken ct = default)
    {
        try
        {
            var requester = await RequireAdminAsync(requestingAdminId, ct);
            var vendor = await vendors.GetByIdAsync(vendorId, ct) ?? throw new NotFoundException("We couldn't find that vendor.");
            if (!CanManage(vendor, requester)) return ApiResponseFactory.Forbidden<object>("Only a Super Admin or this vendor's creator can remove it.");

            await vendors.RemoveAsync(vendor, ct);
            return new object().ToOkApiResponse("Vendor deleted.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[DeleteAsync] Failed to delete vendor {VendorId}", vendorId);
            return ApiResponseFactory.InternalError<object>("Failed to delete vendor.");
        }
    }

    private VendorResponse ToResponse(Vendor v, AdminUser requester) => new(
        v.Id, v.Name, v.Contact, v.Location, v.Category, v.Summary,
        string.IsNullOrWhiteSpace(v.PhotoStoragePath) ? null : storageService.BuildPublicUrl(v.PhotoStoragePath),
        string.IsNullOrWhiteSpace(v.ContractStoragePath) ? null : storageService.BuildPublicUrl(v.ContractStoragePath),
        v.ContractFileName,
        CanManage(v, requester));
}
