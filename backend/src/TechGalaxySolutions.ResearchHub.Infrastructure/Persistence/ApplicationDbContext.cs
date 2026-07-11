using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Domain.Entities;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<ProjectDocument> ProjectDocuments => Set<ProjectDocument>();
    public DbSet<Domain.Entities.Notification> Notifications => Set<Domain.Entities.Notification>();
    public DbSet<GuideProfile> GuideProfiles => Set<GuideProfile>();
    public DbSet<Domain.Entities.Review> Reviews => Set<Domain.Entities.Review>();
    public DbSet<Chapter> Chapters => Set<Chapter>();
    public DbSet<ChapterComment> ChapterComments => Set<ChapterComment>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<MeetingParticipant> MeetingParticipants => Set<MeetingParticipant>();
    public DbSet<ApprovalHistory> ApprovalHistories => Set<ApprovalHistory>();
    public DbSet<DepartmentProfile> DepartmentProfiles => Set<DepartmentProfile>();
    public DbSet<DepartmentSettings> DepartmentSettings => Set<DepartmentSettings>();
    public DbSet<ResearchCategory> ResearchCategories => Set<ResearchCategory>();
    public DbSet<ResearchTopic> ResearchTopics => Set<ResearchTopic>();
    public DbSet<ProjectAllocation> ProjectAllocations => Set<ProjectAllocation>();
    public DbSet<DepartmentAnnouncement> DepartmentAnnouncements => Set<DepartmentAnnouncement>();
    public DbSet<DepartmentReport> DepartmentReports => Set<DepartmentReport>();
    public DbSet<College> Colleges => Set<College>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Semester> Semesters => Set<Semester>();
    public DbSet<FacultyMember> FacultyMembers => Set<FacultyMember>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<GlobalAnnouncement> GlobalAnnouncements => Set<GlobalAnnouncement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasOne(u => u.Role).WithMany(r => r.Users).HasForeignKey(u => u.RoleId);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();
            entity.HasOne(rt => rt.User).WithMany().HasForeignKey(rt => rt.UserId);
        });

        modelBuilder.Entity<StudentProfile>(entity =>
        {
            entity.HasIndex(sp => sp.UserId).IsUnique();
            entity.HasOne(sp => sp.User).WithMany().HasForeignKey(sp => sp.UserId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(sp => sp.Guide).WithMany().HasForeignKey(sp => sp.GuideId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasOne(p => p.Student).WithMany().HasForeignKey(p => p.StudentId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.HasOne(pm => pm.Project).WithMany(p => p.Members).HasForeignKey(pm => pm.ProjectId);
            entity.HasOne(pm => pm.User).WithMany().HasForeignKey(pm => pm.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasOne(t => t.Project).WithMany(p => p.Tasks).HasForeignKey(t => t.ProjectId);
            entity.HasOne(t => t.AssignedTo).WithMany().HasForeignKey(t => t.AssignedToId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Milestone>(entity =>
        {
            entity.HasOne(m => m.Project).WithMany(p => p.Milestones).HasForeignKey(m => m.ProjectId);
        });

        modelBuilder.Entity<ProjectDocument>(entity =>
        {
            entity.HasOne(d => d.Project).WithMany(p => p.Documents).HasForeignKey(d => d.ProjectId);
            entity.HasOne(d => d.Uploader).WithMany().HasForeignKey(d => d.UploaderId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Domain.Entities.Notification>(entity =>
        {
            entity.HasOne(n => n.User).WithMany().HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.NoAction);
            entity.HasIndex(n => n.UserId);
        });

        modelBuilder.Entity<GuideProfile>(entity =>
        {
            entity.HasIndex(g => g.UserId).IsUnique();
            entity.HasOne(g => g.User).WithMany().HasForeignKey(g => g.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Domain.Entities.Review>(entity =>
        {
            entity.HasOne(r => r.Project).WithMany(p => p.Reviews).HasForeignKey(r => r.ProjectId);
            entity.HasOne(r => r.Guide).WithMany().HasForeignKey(r => r.GuideId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Chapter>(entity =>
        {
            entity.HasOne(c => c.Project).WithMany(p => p.Chapters).HasForeignKey(c => c.ProjectId);
        });

        modelBuilder.Entity<ChapterComment>(entity =>
        {
            entity.HasOne(c => c.Chapter).WithMany(c => c.Comments).HasForeignKey(c => c.ChapterId);
            entity.HasOne(c => c.User).WithMany().HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Meeting>(entity =>
        {
            entity.HasOne(m => m.Guide).WithMany().HasForeignKey(m => m.GuideId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<MeetingParticipant>(entity =>
        {
            entity.HasOne(m => m.Meeting).WithMany(m => m.Participants).HasForeignKey(m => m.MeetingId);
            entity.HasOne(m => m.User).WithMany().HasForeignKey(m => m.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ApprovalHistory>(entity =>
        {
            entity.HasOne(a => a.Project).WithMany().HasForeignKey(a => a.ProjectId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(a => a.Chapter).WithMany().HasForeignKey(a => a.ChapterId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(a => a.Guide).WithMany().HasForeignKey(a => a.GuideId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<DepartmentProfile>(entity =>
        {
            entity.HasIndex(d => d.DepartmentName).IsUnique();
            entity.HasOne(d => d.HodUser).WithMany().HasForeignKey(d => d.HodUserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DepartmentSettings>(entity =>
        {
            entity.HasOne(d => d.DepartmentProfile).WithMany().HasForeignKey(d => d.DepartmentProfileId);
        });

        modelBuilder.Entity<ResearchCategory>(entity =>
        {
            entity.HasOne(r => r.DepartmentProfile).WithMany().HasForeignKey(r => r.DepartmentProfileId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ResearchTopic>(entity =>
        {
            entity.HasOne(r => r.Category).WithMany(c => c.ResearchTopics).HasForeignKey(r => r.CategoryId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(r => r.DepartmentProfile).WithMany().HasForeignKey(r => r.DepartmentProfileId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(r => r.CreatedByUser).WithMany().HasForeignKey(r => r.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ProjectAllocation>(entity =>
        {
            entity.HasOne(a => a.Student).WithMany().HasForeignKey(a => a.StudentId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(a => a.Guide).WithMany().HasForeignKey(a => a.GuideId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(a => a.Project).WithMany().HasForeignKey(a => a.ProjectId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(a => a.AllocatedByUser).WithMany().HasForeignKey(a => a.AllocatedByUserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<DepartmentAnnouncement>(entity =>
        {
            entity.HasOne(a => a.DepartmentProfile).WithMany().HasForeignKey(a => a.DepartmentProfileId);
            entity.HasOne(a => a.CreatedByUser).WithMany().HasForeignKey(a => a.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<DepartmentReport>(entity =>
        {
            entity.HasOne(r => r.DepartmentProfile).WithMany().HasForeignKey(r => r.DepartmentProfileId);
            entity.HasOne(r => r.GeneratedByUser).WithMany().HasForeignKey(r => r.GeneratedByUserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<College>(entity =>
        {
            entity.HasIndex(c => c.Code).IsUnique();
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasIndex(d => d.Code).IsUnique();
            entity.HasOne(d => d.College).WithMany(c => c.Departments).HasForeignKey(d => d.CollegeId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<AcademicYear>(entity =>
        {
            entity.HasIndex(a => a.Name).IsUnique();
        });

        modelBuilder.Entity<Semester>(entity =>
        {
            entity.HasOne(s => s.AcademicYear).WithMany(a => a.Semesters).HasForeignKey(s => s.AcademicYearId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<FacultyMember>(entity =>
        {
            entity.HasIndex(f => f.UserId).IsUnique();
            entity.HasOne(f => f.User).WithMany().HasForeignKey(f => f.UserId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(f => f.Department).WithMany(d => d.FacultyMembers).HasForeignKey(f => f.DepartmentId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasIndex(s => s.Key).IsUnique();
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasOne(a => a.User).WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(a => a.Timestamp);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasIndex(p => p.Name).IsUnique();
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasIndex(rp => new { rp.RoleId, rp.PermissionId }).IsUnique();
            entity.HasOne(rp => rp.Role).WithMany().HasForeignKey(rp => rp.RoleId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(rp => rp.Permission).WithMany().HasForeignKey(rp => rp.PermissionId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<GlobalAnnouncement>(entity =>
        {
            entity.HasOne(a => a.CreatedByUser).WithMany().HasForeignKey(a => a.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        });
    }
}
