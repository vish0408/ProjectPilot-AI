using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAIProposalEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalHistories_Projects_ProjectId",
                table: "ApprovalHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Colleges_CollegeId",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_GuideProfiles_Users_UserId",
                table: "GuideProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Semesters_AcademicYears_AcademicYearId",
                table: "Semesters");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentProfiles_Users_UserId",
                table: "StudentProfiles");

            migrationBuilder.AddColumn<Guid>(
                name: "RoleId1",
                table: "RolePermissions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AIProposals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResearchArea = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Keywords = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Duration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Abstract = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Objectives = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProblemStatement = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LiteratureReview = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Methodology = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedOutcome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timeline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequiredTools = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedResult = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FutureScope = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    References = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIProposals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AIProposals_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId1",
                table: "RolePermissions",
                column: "RoleId1");

            migrationBuilder.CreateIndex(
                name: "IX_AIProposals_StudentId",
                table: "AIProposals",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalHistories_Projects_ProjectId",
                table: "ApprovalHistories",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Colleges_CollegeId",
                table: "Departments",
                column: "CollegeId",
                principalTable: "Colleges",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GuideProfiles_Users_UserId",
                table: "GuideProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissions_Roles_RoleId1",
                table: "RolePermissions",
                column: "RoleId1",
                principalTable: "Roles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Semesters_AcademicYears_AcademicYearId",
                table: "Semesters",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentProfiles_Users_UserId",
                table: "StudentProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalHistories_Projects_ProjectId",
                table: "ApprovalHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Colleges_CollegeId",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_GuideProfiles_Users_UserId",
                table: "GuideProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissions_Roles_RoleId1",
                table: "RolePermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_Semesters_AcademicYears_AcademicYearId",
                table: "Semesters");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentProfiles_Users_UserId",
                table: "StudentProfiles");

            migrationBuilder.DropTable(
                name: "AIProposals");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_RoleId1",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "RoleId1",
                table: "RolePermissions");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalHistories_Projects_ProjectId",
                table: "ApprovalHistories",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Colleges_CollegeId",
                table: "Departments",
                column: "CollegeId",
                principalTable: "Colleges",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GuideProfiles_Users_UserId",
                table: "GuideProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Semesters_AcademicYears_AcademicYearId",
                table: "Semesters",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentProfiles_Users_UserId",
                table: "StudentProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
