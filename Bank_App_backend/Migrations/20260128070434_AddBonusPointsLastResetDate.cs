using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bank_App.Migrations
{
    /// <inheritdoc />
    public partial class AddBonusPointsLastResetDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "BonusPointsLastResetDate",
                table: "UserAccounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BonusPointsLastResetDate",
                table: "UserAccounts");
        }
    }
}
