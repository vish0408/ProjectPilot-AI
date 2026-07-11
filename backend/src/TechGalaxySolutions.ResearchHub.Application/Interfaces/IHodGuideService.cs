using TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IHodGuideService
{
    Task<List<GuideSummaryResponse>> GetGuidesAsync(Guid userId);
    Task AssignGuideAsync(Guid userId, AssignGuideRequest request);
}
