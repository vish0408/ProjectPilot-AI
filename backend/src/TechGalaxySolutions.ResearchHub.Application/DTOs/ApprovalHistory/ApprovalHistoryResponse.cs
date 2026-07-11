namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ApprovalHistory;

public class ApprovalHistoryResponse
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public Guid? ChapterId { get; set; }
    public string? ChapterTitle { get; set; }
    public Guid GuideId { get; set; }
    public string GuideName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
    public string PreviousStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
