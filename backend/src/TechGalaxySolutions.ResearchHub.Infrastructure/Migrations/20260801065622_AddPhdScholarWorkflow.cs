using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPhdScholarWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "JoiningCohort",
                table: "StudentProfiles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhdMode",
                table: "StudentProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RegistrationDate",
                table: "StudentProfiles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RequiredCredits",
                table: "StudentProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ResearchStageId",
                table: "StudentProfiles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ResearchStages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResearchStages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ScholarCoursework",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaperCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PaperName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Credits = table.Column<int>(type: "int", nullable: false),
                    ExamType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExamStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Result = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Marks = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Grade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttemptDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScholarCoursework", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScholarCoursework_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_ResearchStageId",
                table: "StudentProfiles",
                column: "ResearchStageId");

            migrationBuilder.CreateIndex(
                name: "IX_ResearchStages_Name",
                table: "ResearchStages",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResearchStages_SortOrder",
                table: "ResearchStages",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_ScholarCoursework_StudentProfileId",
                table: "ScholarCoursework",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ScholarCoursework_StudentProfileId_PaperCode",
                table: "ScholarCoursework",
                columns: new[] { "StudentProfileId", "PaperCode" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentProfiles_ResearchStages_ResearchStageId",
                table: "StudentProfiles",
                column: "ResearchStageId",
                principalTable: "ResearchStages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentProfiles_ResearchStages_ResearchStageId",
                table: "StudentProfiles");

            migrationBuilder.DropTable(
                name: "ResearchStages");

            migrationBuilder.DropTable(
                name: "ScholarCoursework");

            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_ResearchStageId",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "JoiningCohort",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "PhdMode",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "RegistrationDate",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "RequiredCredits",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "ResearchStageId",
                table: "StudentProfiles");
        }
    }
}
