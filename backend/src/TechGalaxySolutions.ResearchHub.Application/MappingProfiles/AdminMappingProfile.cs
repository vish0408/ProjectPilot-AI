using AutoMapper;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AcademicYear;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AdminDashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AuditLog;
using TechGalaxySolutions.ResearchHub.Application.DTOs.College;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Permission;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Role;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Semester;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GlobalAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.DTOs.SystemSetting;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;
using TechGalaxySolutions.ResearchHub.Domain.Entities;

namespace TechGalaxySolutions.ResearchHub.Application.MappingProfiles;

public class AdminMappingProfile : Profile
{
    public AdminMappingProfile()
    {
        CreateMap<College, CollegeResponse>()
            .ForMember(dest => dest.DepartmentCount, opt => opt.MapFrom(src => src.Departments.Count(d => !d.IsDeleted)));

        CreateMap<Department, DepartmentResponse>()
            .ForMember(dest => dest.CollegeName, opt => opt.MapFrom(src => src.College.Name))
            .ForMember(dest => dest.HodName, opt => opt.MapFrom(src => src.Hod != null ? src.Hod.FullName : null))
            .ForMember(dest => dest.FacultyCount, opt => opt.MapFrom(src => src.FacultyMembers.Count(f => !f.IsDeleted)))
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.DepartmentName))
            .ForMember(dest => dest.DepartmentCode, opt => opt.MapFrom(src => src.DepartmentCode))
            .ForMember(dest => dest.ShortName, opt => opt.MapFrom(src => src.ShortName));

        CreateMap<AcademicYear, AcademicYearResponse>();

        CreateMap<Semester, SemesterResponse>()
            .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear.Name));

        CreateMap<FacultyMember, FacultyResponse>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.DepartmentName));

        CreateMap<User, UserResponse>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name));

        CreateMap<Role, RoleResponse>()
            .ForMember(dest => dest.UserCount, opt => opt.MapFrom(src => src.Users.Count(u => !u.IsDeleted)))
            .ForMember(dest => dest.PermissionNames, opt => opt.Ignore());

        CreateMap<Permission, PermissionResponse>();

        CreateMap<Domain.Entities.Notification, NotificationResponse>();

        CreateMap<AuditLog, AuditLogResponse>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : "System"));

        CreateMap<SystemSetting, SystemSettingResponse>();

        CreateMap<GlobalAnnouncement, GlobalAnnouncementResponse>()
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.FullName));

        CreateMap<Hod, HodResponse>()
            .ForMember(dest => dest.EmployeeId, opt => opt.MapFrom(src => src.User.EmployeeId))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
            .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.User.PhoneNumber))
            .ForMember(dest => dest.Designation, opt => opt.MapFrom(src => src.User.Designation))
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.DepartmentName))
            .ForMember(dest => dest.DepartmentCode, opt => opt.MapFrom(src => src.Department.DepartmentCode))
            .ForMember(dest => dest.CollegeName, opt => opt.MapFrom(src => src.College.Name));
    }
}
