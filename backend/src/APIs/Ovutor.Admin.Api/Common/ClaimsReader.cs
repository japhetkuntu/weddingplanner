using System.Security.Claims;
using Ovutor.Common.Sdk.Exceptions;

namespace Ovutor.Admin.Api.Common;

public static class ClaimsReader
{
    public static Guid GetAdminId(ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (raw is null || !Guid.TryParse(raw, out var id)) throw new UnauthorizedException();
        return id;
    }
}
