namespace TechGalaxySolutions.ResearchHub.Application.DTOs.GuideProfile;

public class GuideProfileResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
}
