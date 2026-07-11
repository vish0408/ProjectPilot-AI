namespace TechGalaxySolutions.ResearchHub.Domain.Entities;

public class DepartmentSettings : BaseEntity
{
    public Guid DepartmentProfileId { get; set; }
    public DepartmentProfile DepartmentProfile { get; set; } = null!;
    public bool AllowStudentRegistration { get; set; } = true;
    public int MaxStudentsPerGuide { get; set; } = 8;
    public bool AutoAllocateGuides { get; set; } = false;
    public bool EnableChapterReview { get; set; } = true;
    public int MinChaptersRequired { get; set; } = 3;
}
