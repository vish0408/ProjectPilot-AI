using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;
using TechGalaxySolutions.ResearchHub.Application.Exceptions;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AdminDepartmentService : IAdminDepartmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    private static readonly string[] FacultyRoleNames = ["Guide", "HOD"];

    public AdminDepartmentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    private async Task<Dictionary<Guid, int>> GetFacultyCountsAsync()
    {
        return await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Where(u => u.DepartmentId.HasValue && !u.IsDeleted)
            .Where(u => u.Role.Name == "Guide" || u.Role.Name == "HOD")
            .GroupBy(u => u.DepartmentId!.Value)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    private async Task<int> GetFacultyCountForDepartmentAsync(Guid departmentId)
    {
        return await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .CountAsync(u => u.DepartmentId == departmentId && !u.IsDeleted &&
                        (u.Role.Name == "Guide" || u.Role.Name == "HOD"));
    }

    public async Task<PagedResponse<DepartmentResponse>> GetDepartmentsAsync(PagedRequest request, Guid? collegeId = null)
    {
        var query = _context.Set<Department>().AsNoTracking()
            .Include(d => d.College)
            .Include(d => d.Hod)
            .Where(d => !d.IsDeleted);

        if (collegeId.HasValue)
            query = query.Where(d => d.CollegeId == collegeId.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(d =>
                d.DepartmentName.ToLower().Contains(term) ||
                d.DepartmentCode.ToLower().Contains(term) ||
                d.ShortName.ToLower().Contains(term) ||
                d.College.Name.ToLower().Contains(term) ||
                (d.Hod != null && d.Hod.FullName.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(request.StatusFilter))
        {
            if (bool.TryParse(request.StatusFilter, out var isActive))
                query = query.Where(d => d.IsActive == isActive);
        }

        query = (request.SortField?.ToLower()) switch
        {
            "departmentname" => request.SortDirection == "desc" ? query.OrderByDescending(d => d.DepartmentName) : query.OrderBy(d => d.DepartmentName),
            "departmentcode" => request.SortDirection == "desc" ? query.OrderByDescending(d => d.DepartmentCode) : query.OrderBy(d => d.DepartmentCode),
            "collegename" => request.SortDirection == "desc" ? query.OrderByDescending(d => d.College.Name) : query.OrderBy(d => d.College.Name),
            "isactive" => request.SortDirection == "desc" ? query.OrderByDescending(d => d.IsActive) : query.OrderBy(d => d.IsActive),
            "createdat" => request.SortDirection == "desc" ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt),
            _ => query.OrderBy(d => d.DepartmentName)
        };

        var totalCount = await query.CountAsync();
        var departments = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var facultyCounts = await GetFacultyCountsAsync();

        var items = _mapper.Map<List<DepartmentResponse>>(departments);
        foreach (var item in items)
            item.FacultyCount = facultyCounts.GetValueOrDefault(item.Id);

        return new PagedResponse<DepartmentResponse>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<List<DepartmentResponse>> GetAllDepartmentsAsync(Guid? collegeId = null)
    {
        var query = _context.Set<Department>().AsNoTracking()
            .Include(d => d.College)
            .Include(d => d.Hod)
            .Where(d => !d.IsDeleted);

        if (collegeId.HasValue)
            query = query.Where(d => d.CollegeId == collegeId.Value);

        var departments = await query
            .OrderBy(d => d.DepartmentName)
            .ToListAsync();

        var facultyCounts = await GetFacultyCountsAsync();

        var response = _mapper.Map<List<DepartmentResponse>>(departments);
        foreach (var item in response)
            item.FacultyCount = facultyCounts.GetValueOrDefault(item.Id);

        return response;
    }

    public async Task<DepartmentResponse> GetDepartmentAsync(Guid id)
    {
        var department = await _context.Set<Department>().AsNoTracking()
            .Include(d => d.College)
            .Include(d => d.Hod)
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department not found");

        var response = _mapper.Map<DepartmentResponse>(department);
        response.FacultyCount = await GetFacultyCountForDepartmentAsync(id);
        return response;
    }

    public async Task<DepartmentResponse> CreateDepartmentAsync(CreateDepartmentRequest request)
    {
        var collegeExists = await _context.Set<College>().AsNoTracking()
            .AnyAsync(c => c.Id == request.CollegeId && !c.IsDeleted);
        if (!collegeExists)
            throw new KeyNotFoundException("College not found");

        var nameExists = await _context.Set<Department>().AsNoTracking()
            .AnyAsync(d => d.DepartmentName == request.DepartmentName && d.CollegeId == request.CollegeId && !d.IsDeleted);
        if (nameExists)
            throw new ConflictException("A department with this name already exists in the selected college");

        var codeExists = await _context.Set<Department>().AsNoTracking()
            .AnyAsync(d => d.DepartmentCode == request.DepartmentCode && d.CollegeId == request.CollegeId && !d.IsDeleted);
        if (codeExists)
            throw new ConflictException("A department with this code already exists in the selected college");

        var department = new Department
        {
            DepartmentCode = request.DepartmentCode,
            DepartmentName = request.DepartmentName,
            ShortName = request.ShortName,
            Description = request.Description,
            CollegeId = request.CollegeId,
        };

        _context.Set<Department>().Add(department);
        await _context.SaveChangesAsync();

        await _context.Entry(department).Reference(d => d.College).LoadAsync();

        var response = _mapper.Map<DepartmentResponse>(department);
        response.FacultyCount = 0;
        return response;
    }

    public async Task<DepartmentResponse> UpdateDepartmentAsync(Guid id, UpdateDepartmentRequest request)
    {
        var department = await _context.Set<Department>()
            .Include(d => d.College)
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department not found");

        var nameExists = await _context.Set<Department>().AsNoTracking()
            .AnyAsync(d => d.DepartmentName == request.DepartmentName && d.CollegeId == request.CollegeId && d.Id != id && !d.IsDeleted);
        if (nameExists)
            throw new ConflictException("A department with this name already exists in the selected college");

        var codeExists = await _context.Set<Department>().AsNoTracking()
            .AnyAsync(d => d.DepartmentCode == request.DepartmentCode && d.CollegeId == request.CollegeId && d.Id != id && !d.IsDeleted);
        if (codeExists)
            throw new ConflictException("A department with this code already exists in the selected college");

        department.DepartmentCode = request.DepartmentCode;
        department.DepartmentName = request.DepartmentName;
        department.ShortName = request.ShortName;
        department.Description = request.Description;
        department.CollegeId = request.CollegeId;
        department.IsActive = request.IsActive;
        department.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = _mapper.Map<DepartmentResponse>(department);
        response.FacultyCount = await GetFacultyCountForDepartmentAsync(id);
        return response;
    }

    public async Task DeleteDepartmentAsync(Guid id)
    {
        var department = await _context.Set<Department>()
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department not found");

        department.IsDeleted = true;
        department.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
