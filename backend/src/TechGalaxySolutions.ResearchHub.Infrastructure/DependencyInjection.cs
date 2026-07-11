using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TechGalaxySolutions.ResearchHub.Application.Configuration;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Infrastructure.AI;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;
using TechGalaxySolutions.ResearchHub.Infrastructure.Services;

namespace TechGalaxySolutions.ResearchHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        // Auth
        services.AddScoped<ITokenService, JwtService>();
        services.AddScoped<IAuthService, AuthService>();

        // Student Workspace
        services.AddScoped<IStudentProfileService, StudentProfileService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<IMilestoneService, MilestoneService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IDashboardService, DashboardService>();

        // Guide Workspace
        services.AddScoped<IGuideProfileService, GuideProfileService>();
        services.AddScoped<IGuideDashboardService, GuideDashboardService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IChapterService, ChapterService>();
        services.AddScoped<IChapterCommentService, ChapterCommentService>();
        services.AddScoped<IMeetingService, MeetingService>();
        services.AddScoped<IApprovalHistoryService, ApprovalHistoryService>();

        // HOD Workspace
        services.AddScoped<IHodProfileService, HodProfileService>();
        services.AddScoped<IHodDashboardService, HodDashboardService>();
        services.AddScoped<IHodStudentService, HodStudentService>();
        services.AddScoped<IHodGuideService, HodGuideService>();
        services.AddScoped<IProjectAllocationService, ProjectAllocationService>();
        services.AddScoped<IResearchCategoryService, ResearchCategoryService>();
        services.AddScoped<IResearchTopicService, ResearchTopicService>();
        services.AddScoped<IAnnouncementService, AnnouncementService>();
        services.AddScoped<IDepartmentReportService, DepartmentReportService>();

        // Admin Workspace
        services.AddScoped<ICollegeService, CollegeService>();
        services.AddScoped<IAdminDepartmentService, AdminDepartmentService>();
        services.AddScoped<IAcademicYearService, AcademicYearService>();
        services.AddScoped<ISemesterService, SemesterService>();
        services.AddScoped<IFacultyService, FacultyService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<IAdminDashboardService, AdminDashboardService>();
        services.AddScoped<IAdminAnnouncementService, AdminAnnouncementService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<ISystemSettingService, SystemSettingService>();

        // AI Providers
        var aiSettings = new AISettings();
        configuration.GetSection("AI").Bind(aiSettings);
        services.AddSingleton(aiSettings);

        services.AddHttpClient();

        services.AddSingleton<IAIProvider, OpenAIProvider>();
        services.AddSingleton<IAIProvider, AnthropicProvider>();
        services.AddSingleton<IAIProvider, GeminiProvider>();
        services.AddSingleton<AIProviderFactory>();

        return services;
    }
}
