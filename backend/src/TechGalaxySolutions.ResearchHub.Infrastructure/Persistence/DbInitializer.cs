using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Domain.Entities;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Roles.AnyAsync())
        {
            return;
        }

        var adminRole = new Role
        {
            Id = Guid.Parse("A1B2C3D4-E5F6-7890-ABCD-EF1234567890"),
            Name = "Admin",
            CreatedAt = DateTime.UtcNow,
        };

        var guideRole = new Role
        {
            Id = Guid.Parse("B2C3D4E5-F6A7-8901-BCDE-F12345678901"),
            Name = "Guide",
            CreatedAt = DateTime.UtcNow,
        };

        var studentRole = new Role
        {
            Id = Guid.Parse("C3D4E5F6-A7B8-9012-CDEF-123456789012"),
            Name = "Student",
            CreatedAt = DateTime.UtcNow,
        };

        var hodRole = new Role
        {
            Id = Guid.Parse("E5F6A7B8-C9D0-1234-EF12-345678901234"),
            Name = "HOD",
            CreatedAt = DateTime.UtcNow,
        };

        context.Roles.AddRange(adminRole, guideRole, studentRole, hodRole);

        var superAdmin = new User
        {
            Id = Guid.Parse("D4E5F6A7-B8C9-0123-DEF1-234567890123"),
            FullName = "Super Admin",
            Email = "superadmin@researchhub.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            IsActive = true,
            RoleId = adminRole.Id,
            CreatedAt = DateTime.UtcNow,
        };

        var vishnu = new User
        {
            Id = Guid.Parse("F47AC10B-58CC-4372-A567-0E02B2C3D479"),
            FullName = "Vishnu P",
            Email = "vishnup@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            IsActive = true,
            RoleId = adminRole.Id,
            CreatedAt = DateTime.UtcNow,
        };

        var studentUser = new User
        {
            Id = Guid.Parse("7C9E6679-7425-40DE-944B-E07FC1F90AE7"),
            FullName = "Priya Sharma",
            Email = "student@iitb.ac.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
            IsActive = true,
            RoleId = studentRole.Id,
            CreatedAt = DateTime.UtcNow,
        };

        var guideUser = new User
        {
            Id = Guid.Parse("B0E7A8D1-F93A-4A9B-9B6E-7B3F2C1A8D4E"),
            FullName = "Dr. Rajesh Mehta",
            Email = "guide@iitb.ac.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Guide@123"),
            IsActive = true,
            RoleId = guideRole.Id,
            CreatedAt = DateTime.UtcNow,
        };

        context.Users.AddRange(superAdmin, vishnu, studentUser, guideUser);

        await context.SaveChangesAsync();
    }
}
