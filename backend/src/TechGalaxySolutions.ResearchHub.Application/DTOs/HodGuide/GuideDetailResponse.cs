namespace TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;

public class GuideDetailResponse
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string College { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public int AssignedStudents { get; set; }
    public int MaxCapacity { get; set; }
    public int CompletedProjects { get; set; }
    public int ActiveProjects { get; set; }
    public int PendingReviews { get; set; }
    public List<GuidedStudentItem> Students { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class GuidedStudentItem
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ResearchTopic { get; set; } = string.Empty;
    public string ProjectStatus { get; set; } = string.Empty;
    public double CompletionPercentage { get; set; }
}
