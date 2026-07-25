using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentToResearchTopic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "DepartmentProfileId",
                table: "ResearchTopics",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentId",
                table: "ResearchTopics",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResearchTopics_DepartmentId",
                table: "ResearchTopics",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ResearchTopics_Departments_DepartmentId",
                table: "ResearchTopics",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ResearchTopics_Departments_DepartmentId",
                table: "ResearchTopics");

            migrationBuilder.DropIndex(
                name: "IX_ResearchTopics_DepartmentId",
                table: "ResearchTopics");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "ResearchTopics");

            migrationBuilder.AlterColumn<Guid>(
                name: "DepartmentProfileId",
                table: "ResearchTopics",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }
    }
}
