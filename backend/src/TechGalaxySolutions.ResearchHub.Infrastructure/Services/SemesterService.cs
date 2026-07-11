using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Semester;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class SemesterService : ISemesterService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public SemesterService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<SemesterResponse>> GetSemestersAsync()
    {
        var semesters = await _context.Set<Semester>().AsNoTracking()
            .Include(s => s.AcademicYear)
            .Where(s => !s.IsDeleted)
            .OrderBy(s => s.Number)
            .ToListAsync();

        return _mapper.Map<List<SemesterResponse>>(semesters);
    }

    public async Task<SemesterResponse> GetSemesterAsync(Guid id)
    {
        var semester = await _context.Set<Semester>().AsNoTracking()
            .Include(s => s.AcademicYear)
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Semester not found");

        return _mapper.Map<SemesterResponse>(semester);
    }

    public async Task<List<SemesterResponse>> GetSemestersByAcademicYearAsync(Guid academicYearId)
    {
        var semesters = await _context.Set<Semester>().AsNoTracking()
            .Include(s => s.AcademicYear)
            .Where(s => s.AcademicYearId == academicYearId && !s.IsDeleted)
            .OrderBy(s => s.Number)
            .ToListAsync();

        return _mapper.Map<List<SemesterResponse>>(semesters);
    }

    public async Task<SemesterResponse> CreateAsync(CreateSemesterRequest request)
    {
        var academicYearExists = await _context.Set<AcademicYear>().AsNoTracking()
            .AnyAsync(ay => ay.Id == request.AcademicYearId && !ay.IsDeleted);

        if (!academicYearExists)
            throw new KeyNotFoundException("Academic year not found");

        var semester = new Semester
        {
            Name = request.Name,
            Number = request.Number,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            AcademicYearId = request.AcademicYearId,
        };

        _context.Set<Semester>().Add(semester);
        await _context.SaveChangesAsync();

        await _context.Entry(semester).Reference(s => s.AcademicYear).LoadAsync();

        return _mapper.Map<SemesterResponse>(semester);
    }

    public async Task<SemesterResponse> UpdateAsync(Guid id, UpdateSemesterRequest request)
    {
        var semester = await _context.Set<Semester>()
            .Include(s => s.AcademicYear)
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Semester not found");

        if (request.IsCurrent && !semester.IsCurrent)
        {
            var currentSemesters = await _context.Set<Semester>()
                .Where(s => s.IsCurrent && !s.IsDeleted && s.Id != id)
                .ToListAsync();

            foreach (var s in currentSemesters)
            {
                s.IsCurrent = false;
                s.UpdatedAt = DateTime.UtcNow;
            }
        }

        semester.Name = request.Name;
        semester.Number = request.Number;
        semester.StartDate = request.StartDate;
        semester.EndDate = request.EndDate;
        semester.AcademicYearId = request.AcademicYearId;
        semester.IsCurrent = request.IsCurrent;
        semester.IsActive = request.IsActive;
        semester.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<SemesterResponse>(semester);
    }

    public async Task DeleteAsync(Guid id)
    {
        var semester = await _context.Set<Semester>()
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Semester not found");

        semester.IsDeleted = true;
        semester.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task SetCurrentAsync(Guid id)
    {
        var semester = await _context.Set<Semester>()
            .Include(s => s.AcademicYear)
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted)
            ?? throw new KeyNotFoundException("Semester not found");

        var currentSemesters = await _context.Set<Semester>()
            .Where(s => s.IsCurrent && !s.IsDeleted && s.Id != id && s.AcademicYearId == semester.AcademicYearId)
            .ToListAsync();

        foreach (var s in currentSemesters)
        {
            s.IsCurrent = false;
            s.UpdatedAt = DateTime.UtcNow;
        }

        semester.IsCurrent = true;
        semester.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
