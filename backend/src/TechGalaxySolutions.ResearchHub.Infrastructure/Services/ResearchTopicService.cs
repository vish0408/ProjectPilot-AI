using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ResearchTopicService : IResearchTopicService
{
    private const string HodRole = "HOD";
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ResearchTopicService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    private async Task<Guid?> GetHodDepartmentIdAsync(Guid userId)
    {
        var hod = await _context.Set<Hod>().AsNoTracking()
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted);
        return hod?.DepartmentId;
    }

    public async Task<List<ResearchTopicResponse>> GetTopicsAsync(Guid userId, string role, Guid? categoryId, string? search, Guid? departmentId)
    {
        var query = _context.Set<ResearchTopic>().AsNoTracking()
            .Include(t => t.Category)
            .Include(t => t.CreatedByUser)
            .Where(t => !t.IsDeleted);

        // HODs are restricted to their own department; they cannot request
        // another department's topics by passing an arbitrary departmentId.
        if (string.Equals(role, HodRole, StringComparison.OrdinalIgnoreCase))
        {
            var hodDepartmentId = await GetHodDepartmentIdAsync(userId);
            if (hodDepartmentId.HasValue)
                query = query.Where(t => t.DepartmentId == hodDepartmentId.Value);
            else
                return new List<ResearchTopicResponse>();
        }
        else if (departmentId.HasValue)
        {
            query = query.Where(t => t.DepartmentId == departmentId.Value);
        }

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(t => t.Title.Contains(term)
                || t.Description.Contains(term)
                || t.Category.Name.Contains(term));
        }

        var topics = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return _mapper.Map<List<ResearchTopicResponse>>(topics);
    }

    public async Task<ResearchTopicResponse> CreateTopicAsync(Guid userId, string role, CreateResearchTopicRequest request)
    {
        var hodDepartmentId = string.Equals(role, HodRole, StringComparison.OrdinalIgnoreCase)
            ? await GetHodDepartmentIdAsync(userId)
            : null;

        var topic = new ResearchTopic
        {
            Title = request.Title,
            Description = request.Description,
            CategoryId = request.CategoryId,
            DepartmentProfileId = await GetDepartmentProfileIdAsync(userId),
            DepartmentId = hodDepartmentId ?? request.DepartmentId,
            CreatedByUserId = userId,
        };

        _context.Set<ResearchTopic>().Add(topic);
        await _context.SaveChangesAsync();

        var saved = await _context.Set<ResearchTopic>().AsNoTracking()
            .Include(t => t.Category)
            .Include(t => t.CreatedByUser)
            .FirstAsync(t => t.Id == topic.Id);

        return _mapper.Map<ResearchTopicResponse>(saved);
    }

    public async Task<ResearchTopicResponse> UpdateTopicAsync(Guid id, Guid userId, string role, UpdateResearchTopicRequest request)
    {
        var topic = await _context.Set<ResearchTopic>()
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted)
            ?? throw new KeyNotFoundException("Topic not found");

        if (string.Equals(role, HodRole, StringComparison.OrdinalIgnoreCase))
            await EnsureHodOwnsTopicAsync(userId, topic);

        topic.Title = request.Title;
        topic.Description = request.Description;
        topic.CategoryId = request.CategoryId;
        topic.IsActive = request.IsActive;
        topic.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var saved = await _context.Set<ResearchTopic>().AsNoTracking()
            .Include(t => t.Category)
            .Include(t => t.CreatedByUser)
            .FirstAsync(t => t.Id == id);

        return _mapper.Map<ResearchTopicResponse>(saved);
    }

    public async Task DeleteTopicAsync(Guid id, Guid userId, string role)
    {
        var topic = await _context.Set<ResearchTopic>()
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted)
            ?? throw new KeyNotFoundException("Topic not found");

        if (string.Equals(role, HodRole, StringComparison.OrdinalIgnoreCase))
            await EnsureHodOwnsTopicAsync(userId, topic);

        topic.IsDeleted = true;
        topic.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private async Task<Guid?> GetDepartmentProfileIdAsync(Guid userId)
    {
        var deptProfile = await _context.Set<DepartmentProfile>().AsNoTracking()
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted);
        return deptProfile?.Id;
    }

    private async Task EnsureHodOwnsTopicAsync(Guid userId, ResearchTopic topic)
    {
        var hodDepartmentId = await GetHodDepartmentIdAsync(userId);
        if (!hodDepartmentId.HasValue || topic.DepartmentId != hodDepartmentId.Value)
            throw new UnauthorizedAccessException("You can only manage topics in your own department");
    }
}
