namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

public class MarkReadRequest
{
    public List<Guid> NotificationIds { get; set; } = new();
}
