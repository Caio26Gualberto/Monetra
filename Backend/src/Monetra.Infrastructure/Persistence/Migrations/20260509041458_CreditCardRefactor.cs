using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Monetra.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CreditCardRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CreditCards_Month",
                table: "CreditCards");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "CreditCards");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "CreditCards");

            migrationBuilder.DropColumn(
                name: "Month",
                table: "CreditCards");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "CreditCards");

            migrationBuilder.AddColumn<int>(
                name: "ClosingDay",
                table: "CreditCards",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DueDay",
                table: "CreditCards",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CreditCardInvoicePayments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreditCardId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Month = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardInvoicePayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardInvoicePayments_CreditCards_CreditCardId",
                        column: x => x.CreditCardId,
                        principalTable: "CreditCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardInvoicePayments_CreditCardId_Month",
                table: "CreditCardInvoicePayments",
                columns: new[] { "CreditCardId", "Month" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CreditCardInvoicePayments");

            migrationBuilder.DropColumn(
                name: "ClosingDay",
                table: "CreditCards");

            migrationBuilder.DropColumn(
                name: "DueDay",
                table: "CreditCards");

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "CreditCards",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "CreditCards",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Month",
                table: "CreditCards",
                type: "nvarchar(7)",
                maxLength: 7,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "CreditCards",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_CreditCards_Month",
                table: "CreditCards",
                column: "Month");
        }
    }
}
