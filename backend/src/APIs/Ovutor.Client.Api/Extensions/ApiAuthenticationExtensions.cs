using Microsoft.AspNetCore.Authentication.JwtBearer;
using Ovutor.Common.Sdk.Security;

namespace Ovutor.Client.Api.Extensions;

public static class ApiAuthenticationExtensions
{
    public static IServiceCollection AddOvutorAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwt = configuration.GetSection("Jwt").Get<JwtSettings>()
            ?? throw new InvalidOperationException("Missing Jwt configuration section.");
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddSingleton<JwtTokenService>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new JwtTokenService(Microsoft.Extensions.Options.Options.Create(jwt)).ValidationParameters();
            });

        services.AddAuthorization();
        return services;
    }
}
