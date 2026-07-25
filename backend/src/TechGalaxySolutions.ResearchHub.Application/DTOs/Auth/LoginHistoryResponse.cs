namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Auth;

public class LoginHistoryResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime LoginTime { get; set; }
    public DateTime? LogoutTime { get; set; }
    public string? IpAddress { get; set; }
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public bool IsSuccess { get; set; }
    public string? FailureReason { get; set; }
    public string? RoleName { get; set; }
}
