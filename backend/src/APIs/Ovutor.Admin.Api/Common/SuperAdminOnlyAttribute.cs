using Microsoft.AspNetCore.Mvc.Filters;
using Ovutor.Common.Sdk.Exceptions;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Repositories;

namespace Ovutor.Admin.Api.Common;

/// <summary>Restricts a controller or action to Super Admins. Checked against the database on every
/// call (not a token claim), so demoting an admin takes effect immediately.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class SuperAdminOnlyAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var admins = context.HttpContext.RequestServices.GetRequiredService<IRepository<AdminUser>>();
        var id = ClaimsReader.GetAdminId(context.HttpContext.User);
        var admin = await admins.GetByIdAsync(id, context.HttpContext.RequestAborted);
        if (admin is null || !admin.IsSuperAdmin) throw new ForbiddenException("Only a Super Admin can do this.");
        await next();
    }
}
