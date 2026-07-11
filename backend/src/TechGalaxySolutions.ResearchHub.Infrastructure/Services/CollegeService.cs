using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.College;
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

    public async Task<List<CollegeResponse>> GetCollegesAsync()
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
        {
            item.DepartmentCount = departmentCounts.GetValueOrDefault(item.Id);
        }

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
