using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ovutor.Postgres.Sdk.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorsAndFullPaymentDueDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "FullPaymentDueDate",
                table: "Clients",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "VendorId",
                table: "BudgetExpenses",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Vendors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Contact = table.Column<string>(type: "text", nullable: true),
                    Location = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vendors", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BudgetExpenses_VendorId",
                table: "BudgetExpenses",
                column: "VendorId");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetExpenses_Vendors_VendorId",
                table: "BudgetExpenses",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetExpenses_Vendors_VendorId",
                table: "BudgetExpenses");

            migrationBuilder.DropTable(
                name: "Vendors");

            migrationBuilder.DropIndex(
                name: "IX_BudgetExpenses_VendorId",
                table: "BudgetExpenses");

            migrationBuilder.DropColumn(
                name: "FullPaymentDueDate",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "BudgetExpenses");
        }
    }
}
