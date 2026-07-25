using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
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
    private readonly IProjectService _projectService;

    public ReviewService(ApplicationDbContext context, IMapper mapper, IProjectService projectService)
    {
        _context = context;
        _mapper = mapper;
        _projectService = projectService;
    }

    public async Task<PagedResponse<ReviewResponse>> GetProjectReviewsAsync(Guid projectId, PagedRequest request)
    {
        var query = _context.Set<Review>().AsNoTracking()
            .Include(r => r.Project)
            .Include(r => r.Guide)
            .Where(r => r.ProjectId == projectId && !r.IsDeleted);

        var totalCount = await query.CountAsync();

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var items = _mapper.Map<List<ReviewResponse>>(reviews);

        return new PagedResponse<ReviewResponse>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PagedResponse<ReviewResponse>> GetMyReviewsAsync(Guid guideId, PagedRequest request)
    {
        var query = _context.Set<Review>().AsNoTracking()
            .Include(r => r.Project)
            .Include(r => r.Guide)
            .Where(r => r.GuideId == guideId && !r.IsDeleted);

        var totalCount = await query.CountAsync();

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var items = _mapper.Map<List<ReviewResponse>>(reviews);

        return new PagedResponse<ReviewResponse>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ReviewResponse> CreateReviewAsync(Guid projectId, Guid guideId, CreateReviewRequest request)
    {
        var project = await _context.Projects
            .Include(p => p.Student)
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.Status == ProjectStatus.Completed)
            throw new InvalidOperationException("Cannot review a completed project");

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
            Action = request.Status switch
            {
                "Approved" => ApprovalAction.Approved,
                "Rejected" => ApprovalAction.Rejected,
                "ChangesRequested" => ApprovalAction.ChangesRequested,
                _ => ApprovalAction.Submitted,
            },
            Comments = request.Notes,
            PreviousStatus = project.Status.ToString(),
        };
        _context.Set<ApprovalHistory>().Add(history);

        switch (request.Status)
        {
            case "Approved":
                project.Status = ProjectStatus.Completed;
                _context.Notifications.Add(new Notification
                {
                    UserId = project.StudentId,
                    Title = "Project Approved",
                    Message = $"Your project '{project.Title}' has been approved by the guide.",
                    Type = "success",
                });
                break;
            case "Rejected":
                project.Status = ProjectStatus.NotStarted;
                _context.Notifications.Add(new Notification
                {
                    UserId = project.StudentId,
                    Title = "Project Rejected",
                    Message = $"Your project '{project.Title}' has been rejected by the guide.",
                    Type = "error",
                });
                break;
            case "ChangesRequested":
                project.Status = ProjectStatus.OnHold;
                _context.Notifications.Add(new Notification
                {
                    UserId = project.StudentId,
                    Title = "Revision Requested",
                    Message = $"Your project '{project.Title}' needs revisions. Guide notes: {request.Notes}",
                    Type = "warning",
                });
                break;
        }

        await _context.SaveChangesAsync();

        var hodProfile = await _context.Set<DepartmentProfile>().FirstOrDefaultAsync(d => !d.IsDeleted);
        if (hodProfile?.HodUserId != null)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = hodProfile.HodUserId.Value,
                Title = "Project Review Submitted",
                Message = $"Project '{project.Title}' was reviewed by the guide with status: {request.Status}.",
                Type = "info",
            });
            await _context.SaveChangesAsync();
        }

        await _projectService.RecalculateCompletionPercentageAsync(projectId);

        var saved = await _context.Set<Review>().AsNoTracking()
            .Include(r => r.Project)
            .Include(r => r.Guide)
            .FirstAsync(r => r.Id == review.Id);

        return _mapper.Map<ReviewResponse>(saved);
    }
}
