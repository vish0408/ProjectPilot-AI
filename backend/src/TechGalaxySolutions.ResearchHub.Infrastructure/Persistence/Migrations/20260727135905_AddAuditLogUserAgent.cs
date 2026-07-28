using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditLogUserAgent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                table: "AuditLogs",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserAgent",
                table: "AuditLogs");
        }
    }
}
