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
        await EnsureProvisionedAsync();

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

    public async Task EnsureProvisionedAsync()
    {
        var today = DateTime.UtcNow.Date;
        var currentYear = today.Year;

        var existing = await _context.Set<AcademicYear>().AsNoTracking()
            .Where(ay => !ay.IsDeleted)
            .ToDictionaryAsync(ay => ay.Name, ay => ay.Id);

        var desiredYears = new List<int>();
        for (var year = currentYear - 1; year <= currentYear + 5; year++)
            desiredYears.Add(year);

        var changed = false;

        foreach (var startYear in desiredYears)
        {
            var name = $"{startYear}-{(startYear + 1) % 100:00}";
            if (existing.ContainsKey(name))
                continue;

            _context.Set<AcademicYear>().Add(new AcademicYear
            {
                Name = name,
                StartDate = new DateTime(startYear, 7, 1),
                EndDate = new DateTime(startYear + 1, 6, 30),
                IsCurrent = startYear == currentYear,
            });
            changed = true;
        }

        if (changed)
            await _context.SaveChangesAsync();

        var currentAcadYear = await _context.Set<AcademicYear>().AsNoTracking()
            .FirstOrDefaultAsync(ay => ay.IsCurrent && !ay.IsDeleted);

        if (currentAcadYear == null)
        {
            var nowName = $"{currentYear}-{(currentYear + 1) % 100:00}";
            var nowYear = await _context.Set<AcademicYear>()
                .FirstOrDefaultAsync(ay => ay.Name == nowName && !ay.IsDeleted);

            if (nowYear != null)
            {
                nowYear.IsCurrent = true;
                nowYear.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        var provisionedYears = await _context.Set<AcademicYear>().AsNoTracking()
            .Where(ay => !ay.IsDeleted)
            .ToListAsync();

        foreach (var year in provisionedYears)
        {
            var semesterCount = await _context.Set<Semester>().AsNoTracking()
                .CountAsync(s => s.AcademicYearId == year.Id && !s.IsDeleted);

            if (semesterCount > 0)
                continue;

            var startDate = new DateTime(year.StartDate.Year, 7, 1);
            for (var i = 1; i <= 8; i++)
            {
                _context.Set<Semester>().Add(new Semester
                {
                    Name = $"Sem {i}",
                    Number = i,
                    StartDate = startDate.AddMonths((i - 1) * 3),
                    EndDate = startDate.AddMonths(i * 3).AddDays(-1),
                    AcademicYearId = year.Id,
                });
            }

            await _context.SaveChangesAsync();
        }
    }
}
