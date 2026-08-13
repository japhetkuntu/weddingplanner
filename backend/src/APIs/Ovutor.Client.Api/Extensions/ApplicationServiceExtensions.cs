using Microsoft.EntityFrameworkCore;
using Ovutor.Client.Api.Interfaces;
using Ovutor.Client.Api.Services;
using Ovutor.Postgres.Sdk.Persistence;
using Ovutor.Postgres.Sdk.Repositories;
using Ovutor.Storage.Sdk.Extensions;

namespace Ovutor.Client.Api.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddOvutorPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<OvutorDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Ovutor")));

        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        return services;
    }

    public static IServiceCollection AddOvutorInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddStorageSdk(configuration);
        return services;
    }

    public static IServiceCollection AddOvutorServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IMeService, MeService>();
        services.AddScoped<IPublicSiteService, PublicSiteService>();
        return services;
    }

    public static IServiceCollection AddOvutorCors(this IServiceCollection services, IConfiguration configuration, string policyName)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        services.AddCors(options => options.AddPolicy(policyName, policy => policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()));
        return services;
    }
}
