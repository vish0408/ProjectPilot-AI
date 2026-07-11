namespace TechGalaxySolutions.ResearchHub.Application.DTOs.SystemSetting;

public class SystemSettingResponse
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
