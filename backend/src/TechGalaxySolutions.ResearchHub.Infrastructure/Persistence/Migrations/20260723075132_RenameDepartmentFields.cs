using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameDepartmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Departments",
                newName: "ShortName");

            migrationBuilder.RenameColumn(
                name: "Code",
                table: "Departments",
                newName: "DepartmentCode");

            migrationBuilder.RenameIndex(
                name: "IX_Departments_Code",
                table: "Departments",
                newName: "IX_Departments_DepartmentCode");

            migrationBuilder.AddColumn<string>(
                name: "DepartmentName",
                table: "Departments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DepartmentName",
                table: "Departments");

            migrationBuilder.RenameColumn(
                name: "ShortName",
                table: "Departments",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "DepartmentCode",
                table: "Departments",
                newName: "Code");

            migrationBuilder.RenameIndex(
                name: "IX_Departments_DepartmentCode",
                table: "Departments",
                newName: "IX_Departments_Code");
        }
    }
}
