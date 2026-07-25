using AutoMapper;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentReport;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProfile;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ProjectAllocation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;

namespace TechGalaxySolutions.ResearchHub.Application.MappingProfiles;

public class HodMappingProfile : Profile
{
    public HodMappingProfile()
    {
        CreateMap<DepartmentProfile, HodProfileResponse>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.HodUser != null ? src.HodUser.FullName : ""))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.HodUser != null ? src.HodUser.Email : ""))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.HodUserId));

        CreateMap<ResearchCategory, ResearchCategoryResponse>()
            .ForMember(dest => dest.ResearchTopicCount, opt => opt.MapFrom(src => src.ResearchTopics.Count(t => !t.IsDeleted)));

        CreateMap<ResearchTopic, ResearchTopicResponse>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.FullName))
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.DepartmentName : null));

        CreateMap<ProjectAllocation, ProjectAllocationResponse>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student.FullName))
            .ForMember(dest => dest.GuideName, opt => opt.MapFrom(src => src.Guide.FullName))
            .ForMember(dest => dest.ProjectTitle, opt => opt.MapFrom(src => src.Project != null ? src.Project.Title : null))
            .ForMember(dest => dest.AllocatedByName, opt => opt.MapFrom(src => src.AllocatedByUser.FullName));

        CreateMap<DepartmentAnnouncement, DepartmentAnnouncementResponse>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority.ToString()))
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.FullName));

        CreateMap<DepartmentReport, DepartmentReportResponse>()
            .ForMember(dest => dest.GeneratedByName, opt => opt.MapFrom(src => src.GeneratedByUser.FullName));

        CreateMap<Domain.Entities.Notification, NotificationResponse>();
    }
}
