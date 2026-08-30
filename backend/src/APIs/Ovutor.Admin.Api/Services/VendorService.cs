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

public class VendorService(IRepository<Vendor> vendors, IStorageService storageService, ILogger<VendorService> logger) : IVendorService
{
    public async Task<IApiResponse<List<VendorResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        try
        {
            var list = await vendors.GetQueryable().OrderBy(v => v.Location).ThenBy(v => v.Name).ToListAsync(ct);
            return list.Select(ToResponse).ToList().ToOkApiResponse();
        }
        catch (Exception e)
        {
            logger.LogError(e, "[GetAllAsync] Failed to load vendors");
            return ApiResponseFactory.InternalError<List<VendorResponse>>("Failed to load vendors.");
        }
    }

    public async Task<IApiResponse<VendorResponse>> AddAsync(CreateVendorRequest request, CancellationToken ct = default)
    {
        try
        {
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
            };
            await vendors.AddAsync(vendor, ct);
            return ToResponse(vendor).ToCreatedApiResponse("Vendor added.");
        }
        catch (Exception e)
        {
            logger.LogError(e, "[AddAsync] Failed to add vendor");
            return ApiResponseFactory.InternalError<VendorResponse>("Failed to add vendor.");
        }
    }

    public async Task<IApiResponse<VendorResponse>> UpdateAsync(Guid vendorId, UpdateVendorRequest request, CancellationToken ct = default)
    {
        try
        {
            var vendor = await vendors.GetByIdAsync(vendorId, ct) ?? throw new NotFoundException("We couldn't find that vendor.");
            vendor.Name = string.IsNullOrWhiteSpace(request.Name) ? vendor.Name : request.Name.Trim();
            vendor.Location = string.IsNullOrWhiteSpace(request.Location) ? vendor.Location : request.Location.Trim();
            vendor.Contact = string.IsNullOrWhiteSpace(request.Contact) ? null : request.Contact.Trim();
            vendor.Category = string.IsNullOrWhiteSpace(request.Category) ? null : request.Category.Trim();
            vendor.Summary = string.IsNullOrWhiteSpace(request.Summary) ? null : request.Summary.Trim();
            await vendors.UpdateAsync(vendor, ct);
            return ToResponse(vendor).ToOkApiResponse("Saved.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UpdateAsync] Failed to update vendor {VendorId}", vendorId);
            return ApiResponseFactory.InternalError<VendorResponse>("Failed to save vendor.");
        }
    }

    public async Task<IApiResponse<VendorResponse>> UploadPhotoAsync(Guid vendorId, IFormFile file, CancellationToken ct = default)
    {
        try
        {
            var vendor = await vendors.GetByIdAsync(vendorId, ct) ?? throw new NotFoundException("We couldn't find that vendor.");
            if (file.Length == 0) throw new OvutorException("The selected file is empty.", 400);

            vendor.PhotoStoragePath = await storageService.UploadAsync(new UploadFileRequest
            {
                OpenContent = file.OpenReadStream,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                Folder = "vendors",
            }, ct);
            await vendors.UpdateAsync(vendor, ct);
            return ToResponse(vendor).ToOkApiResponse("Photo uploaded.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UploadPhotoAsync] Failed to upload photo for vendor {VendorId}", vendorId);
            return ApiResponseFactory.InternalError<VendorResponse>("Failed to upload photo.");
        }
    }

    public async Task<IApiResponse<VendorResponse>> UploadContractAsync(Guid vendorId, IFormFile file, CancellationToken ct = default)
    {
        try
        {
            var vendor = await vendors.GetByIdAsync(vendorId, ct) ?? throw new NotFoundException("We couldn't find that vendor.");
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
            return ToResponse(vendor).ToOkApiResponse("Contract uploaded.");
        }
        catch (OvutorException) { throw; }
        catch (Exception e)
        {
            logger.LogError(e, "[UploadContractAsync] Failed to upload contract for vendor {VendorId}", vendorId);
            return ApiResponseFactory.InternalError<VendorResponse>("Failed to upload contract.");
        }
    }

    public async Task<IApiResponse<object>> DeleteAsync(Guid vendorId, CancellationToken ct = default)
    {
        try
        {
            var vendor = await vendors.GetByIdAsync(vendorId, ct) ?? throw new NotFoundException("We couldn't find that vendor.");
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

    private VendorResponse ToResponse(Vendor v) => new(
        v.Id, v.Name, v.Contact, v.Location, v.Category, v.Summary,
        string.IsNullOrWhiteSpace(v.PhotoStoragePath) ? null : storageService.BuildPublicUrl(v.PhotoStoragePath),
        string.IsNullOrWhiteSpace(v.ContractStoragePath) ? null : storageService.BuildPublicUrl(v.ContractStoragePath),
        v.ContractFileName);
}
