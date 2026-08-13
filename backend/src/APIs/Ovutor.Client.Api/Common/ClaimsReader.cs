using System.Security.Claims;
using Ovutor.Common.Sdk.Exceptions;

namespace Ovutor.Client.Api.Common;

public static class ClaimsReader
{
    public static Guid GetClientId(ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (raw is null || !Guid.TryParse(raw, out var id)) throw new UnauthorizedException();
        return id;
    }
}
