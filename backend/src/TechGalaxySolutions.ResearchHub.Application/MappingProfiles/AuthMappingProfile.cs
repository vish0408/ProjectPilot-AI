using AutoMapper;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;
using TechGalaxySolutions.ResearchHub.Domain.Entities;

namespace TechGalaxySolutions.ResearchHub.Application.MappingProfiles;

public class AuthMappingProfile : Profile
{
    public AuthMappingProfile()
    {
        CreateMap<User, CurrentUserResponse>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name))
            .ForMember(dest => dest.CollegeId, opt => opt.MapFrom(src => src.CollegeId.HasValue ? src.CollegeId.Value.ToString() : null))
            .ForMember(dest => dest.DepartmentId, opt => opt.MapFrom(src => src.DepartmentId.HasValue ? src.DepartmentId.Value.ToString() : null))
            .ForMember(dest => dest.CollegeName, opt => opt.MapFrom(src => src.CollegeEntity != null ? src.CollegeEntity.Name : src.College))
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.DepartmentEntity != null ? src.DepartmentEntity.DepartmentName : src.Department));

        CreateMap<LoginHistory, LoginHistoryResponse>();
    }
}
