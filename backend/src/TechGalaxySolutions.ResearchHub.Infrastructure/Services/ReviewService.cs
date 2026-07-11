using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Review;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ReviewService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ReviewResponse>> GetProjectReviewsAsync(Guid projectId)
    {
        var reviews = await _context.Set<Review>().AsNoTracking()
            .Include(r => r.Project)
            .Include(r => r.Guide)
            .Where(r => r.ProjectId == projectId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ReviewResponse>>(reviews);
    }

    public async Task<List<ReviewResponse>> GetMyReviewsAsync(Guid guideId)
    {
        var reviews = await _context.Set<Review>().AsNoTracking()
            .Include(r => r.Project)
            .Include(r => r.Guide)
            .Where(r => r.GuideId == guideId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<ReviewResponse>>(reviews);
    }

    public async Task<ReviewResponse> CreateReviewAsync(Guid projectId, Guid guideId, CreateReviewRequest request)
    {
        var project = await _context.Projects.FindAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found");

        var review = new Review
        {
            ProjectId = projectId,
            GuideId = guideId,
            Status = Enum.Parse<ReviewStatus>(request.Status),
            Notes = request.Notes,
            ReviewedAt = DateTime.UtcNow,
        };

        _context.Set<Review>().Add(review);

        var history = new ApprovalHistory
        {
            ProjectId = projectId,
            GuideId = guideId,
            Action = Enum.Parse<ApprovalAction>(request.Status),
            Comments = request.Notes,
            PreviousStatus = project.Status.ToString(),
        };
        _context.Set<ApprovalHistory>().Add(history);

        if (request.Status == "Approved")
            project.Status = ProjectStatus.Completed;
        else if (request.Status == "ChangesRequested")
            project.Status = ProjectStatus.OnHold;

        await _context.SaveChangesAsync();

        var saved = await _context.Set<Review>().AsNoTracking()
            .Include(r => r.Project)
            .Include(r => r.Guide)
            .FirstAsync(r => r.Id == review.Id);

        return _mapper.Map<ReviewResponse>(saved);
    }
}
