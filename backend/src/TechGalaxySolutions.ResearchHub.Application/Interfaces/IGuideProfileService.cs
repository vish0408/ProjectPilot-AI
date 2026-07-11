using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideProfile;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IGuideProfileService
{
    Task<GuideProfileResponse> GetProfileAsync(Guid userId);
    Task<GuideProfileResponse> UpdateProfileAsync(Guid userId, UpdateGuideProfileRequest request);
}
