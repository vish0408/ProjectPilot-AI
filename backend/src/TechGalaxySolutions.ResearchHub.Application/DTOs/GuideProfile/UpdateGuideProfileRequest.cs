namespace TechGalaxySolutions.ResearchHub.Application.DTOs.GuideProfile;

public class UpdateGuideProfileRequest
{
    public string Bio { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
}
