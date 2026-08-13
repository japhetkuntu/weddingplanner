using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Ovutor.Postgres.Sdk.Persistence;

/// <summary>Lets `dotnet ef migrations add/update` run against this SDK project directly, without
/// needing either API project as a startup project. Connection string matches docker-compose.yml.</summary>
public class OvutorDbContextFactory : IDesignTimeDbContextFactory<OvutorDbContext>
{
    public OvutorDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("OVUTOR_DB_CONNECTION")
            ?? "Host=localhost;Port=5432;Database=Ovutor;Username=ovutor;Password=localdev";

        var optionsBuilder = new DbContextOptionsBuilder<OvutorDbContext>();
        optionsBuilder.UseNpgsql(connectionString);
        return new OvutorDbContext(optionsBuilder.Options);
    }
}
