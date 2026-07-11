using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class FacultyService : IFacultyService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public FacultyService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<FacultyResponse>> GetFacultiesAsync()
    {
        var faculties = await _context.Set<FacultyMember>().AsNoTracking()
            .Include(f => f.User)
            .Include(f => f.Department)
            .Where(f => !f.IsDeleted)
            .OrderBy(f => f.User.FullName)
            .ToListAsync();

        return _mapper.Map<List<FacultyResponse>>(faculties);
    }

    public async Task<FacultyResponse> GetFacultyAsync(Guid id)
    {
        var faculty = await _context.Set<FacultyMember>().AsNoTracking()
            .Include(f => f.User)
            .Include(f => f.Department)
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted)
            ?? throw new KeyNotFoundException("Faculty member not found");

        return _mapper.Map<FacultyResponse>(faculty);
    }

    public async Task<FacultyResponse> CreateAsync(CreateFacultyRequest request)
    {
        var userExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Id == request.UserId && !u.IsDeleted);

        if (!userExists)
            throw new KeyNotFoundException("User not found");

        var alreadyFaculty = await _context.Set<FacultyMember>().AsNoTracking()
            .AnyAsync(f => f.UserId == request.UserId && !f.IsDeleted);

        if (alreadyFaculty)
            throw new InvalidOperationException("User is already a faculty member");

        var departmentExists = await _context.Set<Department>().AsNoTracking()
            .AnyAsync(d => d.Id == request.DepartmentId && !d.IsDeleted);

        if (!departmentExists)
            throw new KeyNotFoundException("Department not found");

        var faculty = new FacultyMember
        {
            UserId = request.UserId,
            DepartmentId = request.DepartmentId,
            Designation = request.Designation,
            Specialization = request.Specialization,
            JoiningDate = request.JoiningDate,
        };

        _context.Set<FacultyMember>().Add(faculty);
        await _context.SaveChangesAsync();

        await _context.Entry(faculty).Reference(f => f.User).LoadAsync();
        await _context.Entry(faculty).Reference(f => f.Department).LoadAsync();

        return _mapper.Map<FacultyResponse>(faculty);
    }

    public async Task<FacultyResponse> UpdateAsync(Guid id, UpdateFacultyRequest request)
    {
        var faculty = await _context.Set<FacultyMember>()
            .Include(f => f.User)
            .Include(f => f.Department)
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted)
            ?? throw new KeyNotFoundException("Faculty member not found");

        faculty.DepartmentId = request.DepartmentId;
        faculty.Designation = request.Designation;
        faculty.Specialization = request.Specialization;
        faculty.JoiningDate = request.JoiningDate;
        faculty.IsActive = request.IsActive;
        faculty.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<FacultyResponse>(faculty);
    }

    public async Task DeleteAsync(Guid id)
    {
        var faculty = await _context.Set<FacultyMember>()
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted)
            ?? throw new KeyNotFoundException("Faculty member not found");

        faculty.IsDeleted = true;
        faculty.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
