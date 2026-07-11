using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;

namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Meeting : BaseEntity
{
    public Guid GuideId { get; set; }
    public User Guide { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; } = 60;
    public string Agenda { get; set; } = string.Empty;
    public string MeetingNotes { get; set; } = string.Empty;
    public string MeetingLink { get; set; } = string.Empty;
    public MeetingStatus Status { get; set; } = MeetingStatus.Scheduled;
    public ICollection<MeetingParticipant> Participants { get; set; } = new List<MeetingParticipant>();
}
