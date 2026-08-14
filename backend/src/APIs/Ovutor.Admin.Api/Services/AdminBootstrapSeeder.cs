using Microsoft.EntityFrameworkCore;
using Ovutor.Common.Sdk.Security;
using Ovutor.Postgres.Sdk.Entities;
using Ovutor.Postgres.Sdk.Persistence;

namespace Ovutor.Admin.Api.Services;

public class AdminBootstrapEntry
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Name { get; set; } = "";
    public string Role { get; set; } = "Lead Planner";
}

/// <summary>Seeds one or more admin accounts from configuration on every startup, since this API has
/// no public registration endpoint — the first admins have to come from somewhere. Reads from
/// AdminBootstrap:Admins (env vars: AdminBootstrap__Admins__0__Email, __Password, __Name, __Role,
/// __Admins__1__... and so on for as many as you configure — nothing is hardcoded). Only creates
/// accounts that don't already exist by email; never touches or resets an existing admin's password,
/// so it's safe to leave the same env vars in place indefinitely.</summary>
public static class AdminBootstrapSeeder
{
    public static async Task SeedAsync(OvutorDbContext db, IConfiguration configuration, ILogger logger, CancellationToken ct = default)
    {
        var entries = configuration.GetSection("AdminBootstrap:Admins").Get<List<AdminBootstrapEntry>>() ?? [];

        foreach (var entry in entries)
        {
            var email = entry.Email.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(entry.Password) || string.IsNullOrWhiteSpace(entry.Name))
            {
                logger.LogWarning("[AdminBootstrapSeeder] Skipped an AdminBootstrap:Admins entry — Email, Password and Name are all required.");
                continue;
            }

            var exists = await db.AdminUsers.AnyAsync(u => u.Email == email, ct);
            if (exists) continue;

            db.AdminUsers.Add(new AdminUser
            {
                Name = entry.Name,
                Email = email,
                PasswordHash = PasswordHasher.Hash(entry.Password),
                Role = string.IsNullOrWhiteSpace(entry.Role) ? "Lead Planner" : entry.Role,
            });
            logger.LogInformation("[AdminBootstrapSeeder] Seeded admin account for {Email}", email);
        }

        if (entries.Count > 0) await db.SaveChangesAsync(ct);
    }
}
