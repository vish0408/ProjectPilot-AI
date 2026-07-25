namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

public class CreateNotificationRequest
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
