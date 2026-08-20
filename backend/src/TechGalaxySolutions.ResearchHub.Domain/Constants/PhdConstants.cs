namespace TechGalaxySolutions.ResearchHub.Domain.Constants;

public static class PhdConstants
{
    public static readonly string[] PhdModes = { "Full-Time", "Part-Time" };

    public static readonly string[] ExamTypes = { "Written", "Practical", "Viva", "Assignment", "Other" };

    public static readonly string[] ExamStatuses = { "Not Scheduled", "Scheduled", "Appeared", "Result Pending", "Passed", "Failed" };

    public static readonly string[] CourseworkStatuses =
    {
        "Not Started",
        "In Progress",
        "Completed",
        "Eligible for Completion",
    };

    public const string ExamStatusPassed = "Passed";

    public const string ExamStatusFailed = "Failed";

    public const string ExamStatusPending = "Result Pending";
}
