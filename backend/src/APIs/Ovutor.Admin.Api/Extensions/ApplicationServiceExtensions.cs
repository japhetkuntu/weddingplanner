using Microsoft.EntityFrameworkCore;
using Ovutor.Admin.Api.Interfaces;
using Ovutor.Admin.Api.Services;
using Ovutor.Cache.Sdk.Extensions;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Persistence;
using Ovutor.Postgres.Sdk.Repositories;
using Ovutor.Storage.Sdk.Extensions;

namespace Ovutor.Admin.Api.Extensions;

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
        services.AddCacheSdk(configuration);
        return services;
    }

    public static IServiceCollection AddOvutorServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IChecklistService, ChecklistService>();
        services.AddScoped<IBudgetService, BudgetService>();
        services.AddScoped<IRsvpService, RsvpService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<IWebsiteService, WebsiteService>();
        services.AddScoped<IAdminUserService, AdminUserService>();
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
