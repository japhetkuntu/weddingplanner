using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ovutor.Postgres.Sdk.Migrations
{
    /// <inheritdoc />
    public partial class AddSuperAdminPlannerAssignmentAndVendorDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Vendors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContractContentType",
                table: "Vendors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContractFileName",
                table: "Vendors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContractStoragePath",
                table: "Vendors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoStoragePath",
                table: "Vendors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "Vendors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedPlannerId",
                table: "Clients",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WeddingType",
                table: "Clients",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSuperAdmin",
                table: "AdminUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_AssignedPlannerId",
                table: "Clients",
                column: "AssignedPlannerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_AdminUsers_AssignedPlannerId",
                table: "Clients",
                column: "AssignedPlannerId",
                principalTable: "AdminUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Every admin that already existed before Super Admin enforcement shipped becomes a Super
            // Admin — otherwise nobody could ever grant the role and the team page would be locked.
            // Whoever actually runs the business can demote everyone else to Planner from the Team page.
            migrationBuilder.Sql("UPDATE \"AdminUsers\" SET \"IsSuperAdmin\" = TRUE;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_AdminUsers_AssignedPlannerId",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_AssignedPlannerId",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "ContractContentType",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "ContractFileName",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "ContractStoragePath",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "PhotoStoragePath",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "AssignedPlannerId",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "WeddingType",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "IsSuperAdmin",
                table: "AdminUsers");
        }
    }
}
