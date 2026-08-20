namespace TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

public class CreateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public Guid RoleId { get; set; }
    public Guid? CollegeId { get; set; }
    public Guid? DepartmentId { get; set; }
    public bool IsActive { get; set; } = true;
    public bool SendWelcomeEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EmployeeId { get; set; }
    public string? Designation { get; set; }

    // Student-specific
    public string? Enrollment { get; set; }
    public Guid? GuideId { get; set; }
    public Guid? AcademicYearId { get; set; }
    public Guid? SemesterId { get; set; }
    public string? Section { get; set; }
    public string? ResearchTopic { get; set; }

    // PhD scholar-specific
    public DateTime? JoiningCohort { get; set; }
    public DateTime? RegistrationDate { get; set; }
    public string? PhdMode { get; set; }
    public int? RequiredCredits { get; set; }
    public Guid? ResearchStageId { get; set; }

    // Guide-specific
    public string? Specialization { get; set; }
    public string? Bio { get; set; }

    // HOD-specific
    public string? Qualification { get; set; }
    public int? YearsOfExperience { get; set; }
}
