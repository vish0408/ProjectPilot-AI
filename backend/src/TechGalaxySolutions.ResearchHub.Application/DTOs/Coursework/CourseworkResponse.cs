namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Coursework;

public class CourseworkResponse
{
    public Guid Id { get; set; }
    public Guid StudentProfileId { get; set; }
    public string PaperCode { get; set; } = string.Empty;
    public string PaperName { get; set; } = string.Empty;
    public int Credits { get; set; }
    public string ExamType { get; set; } = string.Empty;
    public string ExamStatus { get; set; } = string.Empty;
    public string? Result { get; set; }
    public decimal? Marks { get; set; }
    public string? Grade { get; set; }
    public DateTime? AttemptDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
