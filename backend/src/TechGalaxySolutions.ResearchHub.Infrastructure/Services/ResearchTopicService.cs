using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ResearchTopicService : IResearchTopicService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ResearchTopicService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ResearchTopicResponse>> GetTopicsAsync(Guid? categoryId)
    {
        var query = _context.Set<ResearchTopic>()
            .Include(t => t.Category)
            .Include(t => t.CreatedByUser)
            .Where(t => !t.IsDeleted);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        var topics = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return _mapper.Map<List<ResearchTopicResponse>>(topics);
    }

    public async Task<ResearchTopicResponse> CreateTopicAsync(Guid userId, CreateResearchTopicRequest request)
    {
        var deptProfile = await _context.Set<DepartmentProfile>()
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted)
            ?? throw new InvalidOperationException("Department profile not found. Set up your HOD profile first.");

        var topic = new ResearchTopic
        {
            Title = request.Title,
            Description = request.Description,
            CategoryId = request.CategoryId,
            DepartmentProfileId = deptProfile.Id,
            CreatedByUserId = userId,
        };

        _context.Set<ResearchTopic>().Add(topic);
        await _context.SaveChangesAsync();

        var saved = await _context.Set<ResearchTopic>()
            .Include(t => t.Category)
            .Include(t => t.CreatedByUser)
            .FirstAsync(t => t.Id == topic.Id);

        return _mapper.Map<ResearchTopicResponse>(saved);
    }

    public async Task<ResearchTopicResponse> UpdateTopicAsync(Guid id, UpdateResearchTopicRequest request)
    {
        var topic = await _context.Set<ResearchTopic>()
            .Include(t => t.Category)
            .Include(t => t.CreatedByUser)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted)
            ?? throw new KeyNotFoundException("Topic not found");

        topic.Title = request.Title;
        topic.Description = request.Description;
        topic.CategoryId = request.CategoryId;
        topic.IsActive = request.IsActive;
        topic.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return _mapper.Map<ResearchTopicResponse>(topic);
    }
}
