using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.College;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class CollegeService : ICollegeService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CollegeService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResponse<CollegeResponse>> GetCollegesAsync(PagedRequest request)
    {
        var query = _context.Set<College>().AsNoTracking()
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(term) ||
                c.Code.ToLower().Contains(term) ||
                c.Email.ToLower().Contains(term) ||
                c.Address.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(request.StatusFilter))
        {
            var statusTerm = request.StatusFilter.ToLower();
            query = query.Where(c => c.Status.ToLower() == statusTerm);
        }

        query = (request.SortField?.ToLower()) switch
        {
            "name" => request.SortDirection == "desc" ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            "code" => request.SortDirection == "desc" ? query.OrderByDescending(c => c.Code) : query.OrderBy(c => c.Code),
            "createdat" => request.SortDirection == "desc" ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
            _ => query.OrderBy(c => c.Name)
        };

        var totalCount = await query.CountAsync();
        var colleges = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var departmentCounts = await _context.Set<Department>().AsNoTracking()
            .Where(d => !d.IsDeleted)
            .GroupBy(d => d.CollegeId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        var items = _mapper.Map<List<CollegeResponse>>(colleges);
        foreach (var item in items)
            item.DepartmentCount = departmentCounts.GetValueOrDefault(item.Id);

        return new PagedResponse<CollegeResponse>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<List<CollegeResponse>> GetAllCollegesAsync()
    {
        var colleges = await _context.Set<College>().AsNoTracking()
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .ToListAsync();

        var departmentCounts = await _context.Set<Department>().AsNoTracking()
            .Where(d => !d.IsDeleted)
            .GroupBy(d => d.CollegeId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        var response = _mapper.Map<List<CollegeResponse>>(colleges);
        foreach (var item in response)
            item.DepartmentCount = departmentCounts.GetValueOrDefault(item.Id);

        return response;
    }

    public async Task<CollegeResponse> GetCollegeAsync(Guid id)
    {
        var college = await _context.Set<College>().AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted)
            ?? throw new KeyNotFoundException("College not found");

        var departmentCount = await _context.Set<Department>().AsNoTracking()
            .CountAsync(d => d.CollegeId == id && !d.IsDeleted);

        var response = _mapper.Map<CollegeResponse>(college);
        response.DepartmentCount = departmentCount;
        return response;
    }

    public async Task<CollegeResponse> CreateCollegeAsync(CreateCollegeRequest request)
    {
        var college = new College
        {
            Name = request.Name,
            Code = request.Code,
            Address = request.Address,
            Phone = request.Phone,
            Email = request.Email,
            Website = request.Website,
        };

        _context.Set<College>().Add(college);
        await _context.SaveChangesAsync();

        return _mapper.Map<CollegeResponse>(college);
    }

    public async Task<CollegeResponse> UpdateCollegeAsync(Guid id, UpdateCollegeRequest request)
    {
        var college = await _context.Set<College>()
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted)
            ?? throw new KeyNotFoundException("College not found");

        college.Name = request.Name;
        college.Code = request.Code;
        college.Address = request.Address;
        college.Phone = request.Phone;
        college.Email = request.Email;
        college.Website = request.Website;
        college.IsActive = request.IsActive;
        college.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<CollegeResponse>(college);
    }

    public async Task<List<CollegeAnalyticsResponse>> GetCollegeAnalyticsAsync()
    {
        var colleges = await _context.Set<College>().AsNoTracking()
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .ToListAsync();

        var departmentCounts = await _context.Set<Department>().AsNoTracking()
            .Where(d => !d.IsDeleted)
            .GroupBy(d => d.CollegeId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        var userCounts = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted && u.CollegeId != null)
            .GroupBy(u => new { CollegeId = u.CollegeId!.Value, RoleName = u.Role.Name })
            .Select(g => new { g.Key.CollegeId, g.Key.RoleName, Count = g.Count() })
            .ToListAsync();

        var hodCounts = await _context.Set<Hod>().AsNoTracking()
            .Where(h => !h.IsDeleted)
            .GroupBy(h => h.CollegeId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        var researchCounts = await _context.Set<Project>().AsNoTracking()
            .Where(p => !p.IsDeleted && p.Student.CollegeId != null)
            .GroupBy(p => p.Student.CollegeId!.Value)
            .Select(g => new { CollegeId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.CollegeId, g => g.Count);

        return colleges.Select(c =>
        {
            var byRole = userCounts
                .Where(x => x.CollegeId == c.Id)
                .ToDictionary(x => x.RoleName, x => x.Count);

            return new CollegeAnalyticsResponse
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                DepartmentCount = departmentCounts.GetValueOrDefault(c.Id),
                StudentCount = byRole.GetValueOrDefault("Student"),
                GuideCount = byRole.GetValueOrDefault("Guide"),
                HodCount = hodCounts.GetValueOrDefault(c.Id),
                CollegeAdminCount = byRole.GetValueOrDefault("CollegeAdmin"),
                ResearchCount = researchCounts.GetValueOrDefault(c.Id),
            };
        }).ToList();
    }

    public async Task DeleteCollegeAsync(Guid id)
    {
        var college = await _context.Set<College>()
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted)
            ?? throw new KeyNotFoundException("College not found");

        college.IsDeleted = true;
        college.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
