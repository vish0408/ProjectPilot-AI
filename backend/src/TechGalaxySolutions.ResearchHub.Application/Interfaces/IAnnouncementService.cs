using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAnnouncementService
{
    Task<List<DepartmentAnnouncementResponse>> GetAnnouncementsAsync(Guid userId);
    Task<DepartmentAnnouncementResponse> CreateAnnouncementAsync(Guid userId, CreateAnnouncementRequest request);
    Task<DepartmentAnnouncementResponse> UpdateAnnouncementAsync(Guid id, Guid userId, UpdateAnnouncementRequest request);
    Task PublishAnnouncementAsync(Guid id, Guid userId);
    Task ExpireAnnouncementAsync(Guid id, Guid userId);
}
