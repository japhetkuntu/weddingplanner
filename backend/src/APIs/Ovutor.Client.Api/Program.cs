using Microsoft.EntityFrameworkCore;
using Ovutor.Client.Api.Extensions;
using Ovutor.Client.Api.Middleware;
using Ovutor.Postgres.Sdk.Persistence;
using Serilog;

const string CorsPolicyName = "OvutorClientFrontend";

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/client-api-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((context, config) => config.ReadFrom.Configuration(context.Configuration).WriteTo.Console());

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Paste a bearer access token.",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" },
            },
            []
        },
    });
});

builder.Services.AddOvutorPersistence(builder.Configuration);
builder.Services.AddOvutorInfrastructure(builder.Configuration);
builder.Services.AddOvutorServices();
builder.Services.AddOvutorAuthentication(builder.Configuration);
builder.Services.AddOvutorCors(builder.Configuration, CorsPolicyName);
builder.Services.AddHealthChecks();

var app = builder.Build();

// The signing key ships with an obviously-fake dev default so the app runs out of the
// box locally — refuse to boot in Production with it still in place, rather than
// silently issuing tokens no attacker even needs to brute-force.
if (app.Environment.IsProduction() && builder.Configuration["Jwt:SigningKey"]!.StartsWith("dev-only-signing-key"))
{
    throw new InvalidOperationException("Jwt:SigningKey is still the development default — set a real value before deploying.");
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OvutorDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors(CorsPolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
