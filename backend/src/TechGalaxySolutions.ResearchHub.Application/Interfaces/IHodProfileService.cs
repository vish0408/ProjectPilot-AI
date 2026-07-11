using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProfile;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IHodProfileService
{
    Task<HodProfileResponse> GetProfileAsync(Guid userId);
    Task<HodProfileResponse> UpdateProfileAsync(Guid userId, UpdateHodProfileRequest request);
}
