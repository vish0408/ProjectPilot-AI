using AutoMapper;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ApprovalHistory;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Chapter;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideDashboard;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ChapterComment;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideProfile;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Meeting;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Review;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;

namespace TechGalaxySolutions.ResearchHub.Application.MappingProfiles;

public class GuideMappingProfile : Profile
{
    public GuideMappingProfile()
    {
        // Guide Profile
        CreateMap<GuideProfile, GuideProfileResponse>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email));

        // Review
        CreateMap<Review, ReviewResponse>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ProjectTitle, opt => opt.MapFrom(src => src.Project.Title))
            .ForMember(dest => dest.GuideName, opt => opt.MapFrom(src => src.Guide.FullName));

        // Chapter
        CreateMap<Chapter, ChapterResponse>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments));

        CreateMap<ChapterComment, ChapterCommentResponse>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName));

        // Meeting
        CreateMap<Meeting, MeetingResponse>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.GuideName, opt => opt.MapFrom(src => src.Guide.FullName))
            .ForMember(dest => dest.Participants, opt => opt.MapFrom(src => src.Participants));

        CreateMap<MeetingParticipant, MeetingParticipantResponse>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email));

        // Approval History
        CreateMap<ApprovalHistory, ApprovalHistoryResponse>()
            .ForMember(dest => dest.Action, opt => opt.MapFrom(src => src.Action.ToString()))
            .ForMember(dest => dest.ProjectTitle, opt => opt.MapFrom(src => src.Project.Title))
            .ForMember(dest => dest.ChapterTitle, opt => opt.MapFrom(src => src.Chapter != null ? src.Chapter.Title : null))
            .ForMember(dest => dest.GuideName, opt => opt.MapFrom(src => src.Guide.FullName));

        // Dashboard summaries
        CreateMap<Domain.Entities.Notification, NotificationResponse>();
    }
}
