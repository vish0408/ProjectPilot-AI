namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Common;

public class PagedRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public string? RoleFilter { get; set; }
    public string? DepartmentFilter { get; set; }
    public string? CollegeFilter { get; set; }
    public string? GuideFilter { get; set; }
    public string? AcademicYearFilter { get; set; }
    public string? SemesterFilter { get; set; }
    public string? ResearchStageFilter { get; set; }
    public string? PhdModeFilter { get; set; }
    public string? CourseworkStatusFilter { get; set; }
    public string? StatusFilter { get; set; }
    public string? SortField { get; set; }
    public string? SortDirection { get; set; } = "desc";
}

public class PagedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => TotalCount > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;
}
