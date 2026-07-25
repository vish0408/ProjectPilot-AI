namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ThesisReview;

public class ThesisDocumentItem
{
    public Guid DocumentId { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Enrollment { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string ResearchTopic { get; set; } = string.Empty;
    public string? ReviewStatus { get; set; }
    public Guid? ReviewId { get; set; }
    public string? ReviewComment { get; set; }
    public int? ReviewScore { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public int Version { get; set; }
}

public class ThesisReviewRequest
{
    public string Status { get; set; } = "Approved";
    public string Comment { get; set; } = string.Empty;
    public int? Score { get; set; }
}

public class ThesisReviewResponse
{
    public Guid ReviewId { get; set; }
    public Guid DocumentId { get; set; }
    public Guid ProjectId { get; set; }
    public Guid GuideId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public int? Score { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
}
