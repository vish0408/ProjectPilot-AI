using TechGalaxySolutions.ResearchHub.Application.DTOs.StudentProfile;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IStudentProfileService
{
    Task<StudentProfileResponse> GetProfileAsync(Guid userId);
    Task<StudentProfileResponse> UpdateProfileAsync(Guid userId, UpdateStudentProfileRequest request);
}
