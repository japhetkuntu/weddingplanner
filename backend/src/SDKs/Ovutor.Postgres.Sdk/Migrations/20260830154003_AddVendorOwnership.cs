using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ovutor.Postgres.Sdk.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByAdminId",
                table: "Vendors",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vendors_CreatedByAdminId",
                table: "Vendors",
                column: "CreatedByAdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vendors_AdminUsers_CreatedByAdminId",
                table: "Vendors",
                column: "CreatedByAdminId",
                principalTable: "AdminUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Every vendor that existed before ownership was introduced is attributed to the oldest
            // Super Admin account, so nobody's existing directory entries become unmanageable by
            // everyone the day this ships.
            migrationBuilder.Sql(
                "UPDATE \"Vendors\" SET \"CreatedByAdminId\" = (SELECT \"Id\" FROM \"AdminUsers\" WHERE \"IsSuperAdmin\" = TRUE ORDER BY \"CreatedAtUtc\" LIMIT 1) WHERE \"CreatedByAdminId\" IS NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vendors_AdminUsers_CreatedByAdminId",
                table: "Vendors");

            migrationBuilder.DropIndex(
                name: "IX_Vendors_CreatedByAdminId",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "CreatedByAdminId",
                table: "Vendors");
        }
    }
}
