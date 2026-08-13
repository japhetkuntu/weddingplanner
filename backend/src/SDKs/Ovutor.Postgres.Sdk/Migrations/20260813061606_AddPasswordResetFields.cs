using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ovutor.Postgres.Sdk.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetExpiresAtUtc",
                table: "AdminUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetTokenHash",
                table: "AdminUsers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordResetExpiresAtUtc",
                table: "AdminUsers");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenHash",
                table: "AdminUsers");
        }
    }
}
