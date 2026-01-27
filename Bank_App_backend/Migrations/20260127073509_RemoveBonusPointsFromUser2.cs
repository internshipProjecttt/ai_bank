using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bank_App.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBonusPointsFromUser2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BonusPoints",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BonusPoints",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
