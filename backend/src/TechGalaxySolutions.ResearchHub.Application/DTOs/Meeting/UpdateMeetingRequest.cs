namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Meeting;

public class UpdateMeetingRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Agenda { get; set; } = string.Empty;
    public string MeetingNotes { get; set; } = string.Empty;
    public string MeetingLink { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
