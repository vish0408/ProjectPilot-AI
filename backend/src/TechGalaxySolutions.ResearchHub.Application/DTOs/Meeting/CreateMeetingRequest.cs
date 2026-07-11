namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Meeting;

public class CreateMeetingRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; } = 60;
    public string Agenda { get; set; } = string.Empty;
    public string MeetingLink { get; set; } = string.Empty;
    public List<Guid> ParticipantIds { get; set; } = new();
}
