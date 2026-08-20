using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResearchCategoryMasterData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ResearchCategories",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "ResearchCategories",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisciplineGroup",
                table: "ResearchCategories",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "ResearchCategories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ResearchCategories_Code",
                table: "ResearchCategories",
                column: "Code",
                unique: true,
                filter: "[IsDeleted] = 0 AND [Code] <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_ResearchCategories_DisciplineGroup",
                table: "ResearchCategories",
                column: "DisciplineGroup");

            migrationBuilder.CreateIndex(
                name: "IX_ResearchCategories_Name_DisciplineGroup",
                table: "ResearchCategories",
                columns: new[] { "Name", "DisciplineGroup" },
                unique: true,
                filter: "[IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResearchCategories_Code",
                table: "ResearchCategories");

            migrationBuilder.DropIndex(
                name: "IX_ResearchCategories_DisciplineGroup",
                table: "ResearchCategories");

            migrationBuilder.DropIndex(
                name: "IX_ResearchCategories_Name_DisciplineGroup",
                table: "ResearchCategories");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "ResearchCategories");

            migrationBuilder.DropColumn(
                name: "DisciplineGroup",
                table: "ResearchCategories");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "ResearchCategories");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ResearchCategories",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
