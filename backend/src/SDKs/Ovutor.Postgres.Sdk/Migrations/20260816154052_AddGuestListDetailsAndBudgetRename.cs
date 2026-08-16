using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ovutor.Postgres.Sdk.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestListDetailsAndBudgetRename : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Planned",
                table: "BudgetExpenses",
                newName: "Estimated");

            migrationBuilder.RenameColumn(
                name: "Agreed",
                table: "BudgetExpenses",
                newName: "Actual");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "RsvpGuests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Mobile",
                table: "RsvpGuests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsAccommodation",
                table: "RsvpGuests",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "NeedsTransportation",
                table: "RsvpGuests",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "RsvpGuests");

            migrationBuilder.DropColumn(
                name: "Mobile",
                table: "RsvpGuests");

            migrationBuilder.DropColumn(
                name: "NeedsAccommodation",
                table: "RsvpGuests");

            migrationBuilder.DropColumn(
                name: "NeedsTransportation",
                table: "RsvpGuests");

            migrationBuilder.RenameColumn(
                name: "Estimated",
                table: "BudgetExpenses",
                newName: "Planned");

            migrationBuilder.RenameColumn(
                name: "Actual",
                table: "BudgetExpenses",
                newName: "Agreed");
        }
    }
}
