using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Monetra.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PurchaseScheduleStartMonth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Schedule semantics changed: previous purchases cannot be backfilled accurately
            // (anchor depends on creation-time "today's open invoice"). Drop existing rows.
            migrationBuilder.Sql("DELETE FROM CreditCardPurchases;");

            migrationBuilder.AddColumn<string>(
                name: "InstallmentScheduleStartMonth",
                table: "CreditCardPurchases",
                type: "nvarchar(7)",
                maxLength: 7,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InstallmentScheduleStartMonth",
                table: "CreditCardPurchases");
        }
    }
}
