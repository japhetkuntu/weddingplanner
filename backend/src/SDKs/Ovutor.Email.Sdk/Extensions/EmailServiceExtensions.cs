using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ovutor.Email.Sdk.Options;
using Ovutor.Email.Sdk.Services;

namespace Ovutor.Email.Sdk.Extensions;

public static class EmailServiceExtensions
{
    public static IServiceCollection AddEmailSdk(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MailtrapConfig>(configuration.GetSection(MailtrapConfig.SectionName));
        services.AddHttpClient("Mailtrap");
        services.AddScoped<IEmailService, MailtrapEmailService>();
        return services;
    }
}
