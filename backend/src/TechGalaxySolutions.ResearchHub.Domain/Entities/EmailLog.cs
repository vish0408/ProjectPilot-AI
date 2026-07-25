namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class EmailLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string ToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public int Retries { get; set; }
    public DateTime? SentAt { get; set; }
}
