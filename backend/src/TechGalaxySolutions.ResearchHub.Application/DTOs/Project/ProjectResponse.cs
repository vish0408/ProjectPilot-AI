namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Project;

public class ProjectResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? TargetEndDate { get; set; }
    public double CompletionPercentage { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ProjectMemberResponse> Members { get; set; } = new();
}

public class ProjectMemberResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class CreateProjectRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? TargetEndDate { get; set; }
}

public class UpdateProjectRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? TargetEndDate { get; set; }
    public double CompletionPercentage { get; set; }
}
