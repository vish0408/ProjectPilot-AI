namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Meeting;

public class MeetingResponse
{
    public Guid Id { get; set; }
    public Guid GuideId { get; set; }
    public string GuideName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Agenda { get; set; } = string.Empty;
    public string MeetingNotes { get; set; } = string.Empty;
    public string MeetingLink { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<MeetingParticipantResponse> Participants { get; set; } = new();
}

public class MeetingParticipantResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
