using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AcademicYear;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class AcademicYearService : IAcademicYearService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AcademicYearService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AcademicYearResponse>> GetAcademicYearsAsync()
    {
        var academicYears = await _context.Set<AcademicYear>().AsNoTracking()
            .Where(ay => !ay.IsDeleted)
            .OrderByDescending(ay => ay.StartDate)
            .ToListAsync();

        return _mapper.Map<List<AcademicYearResponse>>(academicYears);
    }

    public async Task<AcademicYearResponse> GetAcademicYearAsync(Guid id)
    {
        var academicYear = await _context.Set<AcademicYear>().AsNoTracking()
            .Where(ay => !ay.IsDeleted)
            .FirstOrDefaultAsync(ay => ay.Id == id)
            ?? throw new KeyNotFoundException("Academic year not found");

        return _mapper.Map<AcademicYearResponse>(academicYear);
    }

    public async Task<AcademicYearResponse> CreateAsync(CreateAcademicYearRequest request)
    {
        var academicYear = new AcademicYear
        {
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
        };

        _context.Set<AcademicYear>().Add(academicYear);
        await _context.SaveChangesAsync();

        return _mapper.Map<AcademicYearResponse>(academicYear);
    }

    public async Task<AcademicYearResponse> UpdateAsync(Guid id, UpdateAcademicYearRequest request)
    {
        var academicYear = await _context.Set<AcademicYear>()
            .FirstOrDefaultAsync(ay => ay.Id == id && !ay.IsDeleted)
            ?? throw new KeyNotFoundException("Academic year not found");

        if (request.IsCurrent && !academicYear.IsCurrent)
        {
            var currentYears = await _context.Set<AcademicYear>()
                .Where(ay => ay.IsCurrent && !ay.IsDeleted && ay.Id != id)
                .ToListAsync();

            foreach (var ay in currentYears)
            {
                ay.IsCurrent = false;
                ay.UpdatedAt = DateTime.UtcNow;
            }
        }

        academicYear.Name = request.Name;
        academicYear.StartDate = request.StartDate;
        academicYear.EndDate = request.EndDate;
        academicYear.IsCurrent = request.IsCurrent;
        academicYear.IsActive = request.IsActive;
        academicYear.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<AcademicYearResponse>(academicYear);
    }

    public async Task DeleteAsync(Guid id)
    {
        var academicYear = await _context.Set<AcademicYear>()
            .FirstOrDefaultAsync(ay => ay.Id == id && !ay.IsDeleted)
            ?? throw new KeyNotFoundException("Academic year not found");

        var hasSemesters = await _context.Set<Semester>().AsNoTracking()
            .AnyAsync(s => s.AcademicYearId == id && !s.IsDeleted);

        if (hasSemesters)
            throw new InvalidOperationException("Cannot delete academic year with existing semesters");

        academicYear.IsDeleted = true;
        academicYear.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task SetCurrentAsync(Guid id)
    {
        var academicYear = await _context.Set<AcademicYear>()
            .FirstOrDefaultAsync(ay => ay.Id == id && !ay.IsDeleted)
            ?? throw new KeyNotFoundException("Academic year not found");

        var currentYears = await _context.Set<AcademicYear>()
            .Where(ay => ay.IsCurrent && !ay.IsDeleted && ay.Id != id)
            .ToListAsync();

        foreach (var ay in currentYears)
        {
            ay.IsCurrent = false;
            ay.UpdatedAt = DateTime.UtcNow;
        }

        academicYear.IsCurrent = true;
        academicYear.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
