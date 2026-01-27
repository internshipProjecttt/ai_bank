using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bank_App.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBonusPointsFromUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BonusPoints",
                table: "UserAccounts",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BonusPoints",
                table: "UserAccounts");
        }
    }
}
