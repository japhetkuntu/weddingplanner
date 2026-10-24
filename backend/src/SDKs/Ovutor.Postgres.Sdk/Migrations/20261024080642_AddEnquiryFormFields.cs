using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ovutor.Postgres.Sdk.Migrations
{
    /// <inheritdoc />
    public partial class AddEnquiryFormFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConsultationAt",
                table: "MarketingEnquiries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactingFrom",
                table: "MarketingEnquiries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GroomName",
                table: "MarketingEnquiries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsIntimate",
                table: "MarketingEnquiries",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "WantsConsultation",
                table: "MarketingEnquiries",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConsultationAt",
                table: "MarketingEnquiries");

            migrationBuilder.DropColumn(
                name: "ContactingFrom",
                table: "MarketingEnquiries");

            migrationBuilder.DropColumn(
                name: "GroomName",
                table: "MarketingEnquiries");

            migrationBuilder.DropColumn(
                name: "IsIntimate",
                table: "MarketingEnquiries");

            migrationBuilder.DropColumn(
                name: "WantsConsultation",
                table: "MarketingEnquiries");
        }
    }
}
