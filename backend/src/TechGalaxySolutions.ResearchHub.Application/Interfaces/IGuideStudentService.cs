using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideStudent;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IGuideStudentService
{
    Task<GuideStudentDetailResponse> GetAssignedStudentDetailAsync(Guid guideUserId, Guid studentUserId);
}
