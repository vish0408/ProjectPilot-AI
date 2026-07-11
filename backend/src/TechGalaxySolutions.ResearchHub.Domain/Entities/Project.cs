using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;

namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class Project : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public ProjectStatus Status { get; set; } = ProjectStatus.NotStarted;

    public Guid StudentId { get; set; }

    public User Student { get; set; } = null!;

    public DateTime StartDate { get; set; }

    public DateTime? TargetEndDate { get; set; }

    public double CompletionPercentage { get; set; }

    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

    public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();

    public ICollection<ProjectDocument> Documents { get; set; } = new List<ProjectDocument>();

    public ICollection<Review> Reviews { get; set; } = new List<Review>();

    public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
}
