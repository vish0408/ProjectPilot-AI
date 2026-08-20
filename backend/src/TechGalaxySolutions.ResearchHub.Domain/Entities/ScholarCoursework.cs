namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class ScholarCoursework : BaseEntity
{
    public Guid StudentProfileId { get; set; }

    public StudentProfile StudentProfile { get; set; } = null!;

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
}
