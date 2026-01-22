using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bank_App.Migrations
{
    /// <inheritdoc />
    public partial class FixedRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_UserAccounts_UserAccountId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_UserAccountId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "UserAccountId",
                table: "Transactions");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_AccountId",
                table: "Transactions",
                column: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_UserAccounts_AccountId",
                table: "Transactions",
                column: "AccountId",
                principalTable: "UserAccounts",
                principalColumn: "UserAccountId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_UserAccounts_AccountId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_AccountId",
                table: "Transactions");

            migrationBuilder.AddColumn<int>(
                name: "UserAccountId",
                table: "Transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserAccountId",
                table: "Transactions",
                column: "UserAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_UserAccounts_UserAccountId",
                table: "Transactions",
                column: "UserAccountId",
                principalTable: "UserAccounts",
                principalColumn: "UserAccountId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
