using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ovutor.Postgres.Sdk.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetExpenseTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "BudgetExpenses",
                type: "text",
                nullable: true);

            // Existing rows never had a Title distinct from Vendor — backfill so they keep showing
            // the same label they always have, instead of a blank title, until someone edits them.
            migrationBuilder.Sql("UPDATE \"BudgetExpenses\" SET \"Title\" = \"Vendor\" WHERE \"Title\" IS NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "BudgetExpenses");
        }
    }
}
