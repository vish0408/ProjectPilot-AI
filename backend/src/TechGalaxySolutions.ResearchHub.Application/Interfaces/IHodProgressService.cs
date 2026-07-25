using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProgress;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IHodProgressService
{
    Task<HodProgressResponse> GetProgressAsync(Guid userId);
}
