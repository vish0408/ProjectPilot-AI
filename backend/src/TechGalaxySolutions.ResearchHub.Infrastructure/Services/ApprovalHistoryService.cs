using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ApprovalHistory;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ApprovalHistoryService : IApprovalHistoryService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ApprovalHistoryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ApprovalHistoryResponse>> GetProjectHistoryAsync(Guid projectId)
    {
        var history = await _context.Set<ApprovalHistory>().AsNoTracking()
            .Include(h => h.Project)
            .Include(h => h.Chapter)
            .Include(h => h.Guide)
            .Where(h => h.ProjectId == projectId && !h.IsDeleted)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ApprovalHistoryResponse>>(history);
    }

    public async Task<List<ApprovalHistoryResponse>> GetChapterHistoryAsync(Guid chapterId)
    {
        var history = await _context.Set<ApprovalHistory>().AsNoTracking()
            .Include(h => h.Project)
            .Include(h => h.Chapter)
            .Include(h => h.Guide)
            .Where(h => h.ChapterId == chapterId && !h.IsDeleted)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ApprovalHistoryResponse>>(history);
    }
}
