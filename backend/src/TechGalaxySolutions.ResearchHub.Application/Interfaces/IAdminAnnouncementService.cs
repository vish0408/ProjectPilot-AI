using TechGalaxySolutions.ResearchHub.Application.DTOs.GlobalAnnouncement;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IAdminAnnouncementService
{
    Task<List<GlobalAnnouncementResponse>> GetAnnouncementsAsync();
    Task<GlobalAnnouncementResponse> GetAnnouncementAsync(Guid id);
    Task<GlobalAnnouncementResponse> CreateAnnouncementAsync(Guid userId, CreateGlobalAnnouncementRequest request);
    Task<GlobalAnnouncementResponse> UpdateAnnouncementAsync(Guid id, UpdateGlobalAnnouncementRequest request);
    Task PublishAnnouncementAsync(Guid id);
    Task DeleteAnnouncementAsync(Guid id);
}
