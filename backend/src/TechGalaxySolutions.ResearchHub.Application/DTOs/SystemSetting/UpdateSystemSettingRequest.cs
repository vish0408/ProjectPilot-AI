namespace TechGalaxySolutions.ResearchHub.Application.DTOs.SystemSetting;

public class UpdateSystemSettingRequest
{
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
