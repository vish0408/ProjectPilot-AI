namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class MeetingParticipant : BaseEntity
{
    public Guid MeetingId { get; set; }
    public Meeting Meeting { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
