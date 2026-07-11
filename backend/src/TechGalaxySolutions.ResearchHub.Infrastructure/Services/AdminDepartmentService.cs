using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Department;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AdminDepartmentService : IAdminDepartmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AdminDepartmentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<DepartmentResponse>> GetDepartmentsAsync()
    {
        var departments = await _context.Set<Department>().AsNoTracking()
            .Include(d => d.College)
            .Where(d => !d.IsDeleted)
            .OrderBy(d => d.Name)
            .ToListAsync();

        var facultyCounts = await _context.Set<FacultyMember>().AsNoTracking()
            .Where(f => !f.IsDeleted)
            .GroupBy(f => f.DepartmentId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        var response = _mapper.Map<List<DepartmentResponse>>(departments);
        foreach (var item in response)
        {
            item.FacultyCount = facultyCounts.GetValueOrDefault(item.Id);
        }

        return response;
    }

    public async Task<DepartmentResponse> GetDepartmentAsync(Guid id)
    {
        var department = await _context.Set<Department>().AsNoTracking()
            .Include(d => d.College)
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department not found");

        var facultyCount = await _context.Set<FacultyMember>().AsNoTracking()
            .CountAsync(f => f.DepartmentId == id && !f.IsDeleted);

        var response = _mapper.Map<DepartmentResponse>(department);
        response.FacultyCount = facultyCount;
        return response;
    }

    public async Task<DepartmentResponse> CreateDepartmentAsync(CreateDepartmentRequest request)
    {
        var collegeExists = await _context.Set<College>().AsNoTracking()
            .AnyAsync(c => c.Id == request.CollegeId && !c.IsDeleted);

        if (!collegeExists)
            throw new KeyNotFoundException("College not found");

        var department = new Department
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            CollegeId = request.CollegeId,
        };

        _context.Set<Department>().Add(department);
        await _context.SaveChangesAsync();

        await _context.Entry(department).Reference(d => d.College).LoadAsync();

        return _mapper.Map<DepartmentResponse>(department);
    }

    public async Task<DepartmentResponse> UpdateDepartmentAsync(Guid id, UpdateDepartmentRequest request)
    {
        var department = await _context.Set<Department>()
            .Include(d => d.College)
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department not found");

        department.Name = request.Name;
        department.Code = request.Code;
        department.Description = request.Description;
        department.CollegeId = request.CollegeId;
        department.IsActive = request.IsActive;
        department.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<DepartmentResponse>(department);
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
