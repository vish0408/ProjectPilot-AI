using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentAcademicAndSectionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AcademicYearId",
                table: "StudentProfiles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "StudentProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SemesterId",
                table: "StudentProfiles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_AcademicYearId",
                table: "StudentProfiles",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_SemesterId",
                table: "StudentProfiles",
                column: "SemesterId");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentProfiles_AcademicYears_AcademicYearId",
                table: "StudentProfiles",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentProfiles_Semesters_SemesterId",
                table: "StudentProfiles",
                column: "SemesterId",
                principalTable: "Semesters",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentProfiles_AcademicYears_AcademicYearId",
                table: "StudentProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentProfiles_Semesters_SemesterId",
                table: "StudentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_AcademicYearId",
                table: "StudentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_SemesterId",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "AcademicYearId",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "SemesterId",
                table: "StudentProfiles");
        }
    }
}
