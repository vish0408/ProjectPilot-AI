using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProposal;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Domain.Entities.Enums;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodProposalService : IHodProposalService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HodProposalService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<HodProposalResponse>> GetProposalsAsync(Guid userId, string? status)
    {
        var query = _context.Set<AIProposal>().AsNoTracking()
            .Include(p => p.Student)
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrEmpty(status) && status != "all" && status != "All")
            query = query.Where(p => p.Status.ToLower() == status.ToLower());

        var proposals = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var result = new List<HodProposalResponse>();
        foreach (var p in proposals)
        {
            result.Add(new HodProposalResponse
            {
                Id = p.Id,
                Title = p.Title,
                Abstract = p.Abstract,
                Status = string.IsNullOrEmpty(p.Status) ? "Pending" : p.Status,
                Remarks = null,
                StudentName = p.Student?.FullName ?? "Unknown",
                StudentId = p.StudentId,
                Department = "",
                Version = 1,
                SubmittedAt = p.CreatedAt,
                Comments = new List<ProposalCommentItem>(),
            });
        }

        return result;
    }

    public async Task<HodProposalResponse> GetProposalDetailAsync(Guid userId, Guid proposalId)
    {
        var proposal = await _context.Set<AIProposal>().AsNoTracking()
            .Include(p => p.Student)
            .FirstOrDefaultAsync(p => p.Id == proposalId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Proposal not found");

        var comments = await _context.Set<ApprovalHistory>().AsNoTracking()
            .Include(a => a.Guide)
            .Where(a => a.ProjectId == proposal.Id && !a.IsDeleted)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ProposalCommentItem
            {
                Id = a.Id,
                Comment = a.Comments,
                UserName = a.Guide.FullName,
                CreatedAt = a.CreatedAt,
            })
            .ToListAsync();

        return new HodProposalResponse
        {
            Id = proposal.Id,
            Title = proposal.Title,
            Abstract = proposal.Abstract,
            Status = string.IsNullOrEmpty(proposal.Status) ? "Pending" : proposal.Status,
            Remarks = null,
            StudentName = proposal.Student?.FullName ?? "Unknown",
            StudentId = proposal.StudentId,
            Department = "",
            Version = 1,
            SubmittedAt = proposal.CreatedAt,
            Comments = comments,
        };
    }

    public async Task<HodProposalResponse> ReviewProposalAsync(Guid userId, Guid proposalId, ReviewProposalRequest request)
    {
        var proposal = await _context.Set<AIProposal>()
            .Include(p => p.Student)
            .FirstOrDefaultAsync(p => p.Id == proposalId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Proposal not found");

        var user = await _context.Users.FindAsync(userId);

        proposal.Status = request.Action;
        proposal.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(request.Remarks))
        {
            var history = new ApprovalHistory
            {
                ProjectId = proposal.Id,
                GuideId = userId,
                Action = request.Action == "Approved" ? ApprovalAction.Approved
                    : request.Action == "Rejected" ? ApprovalAction.Rejected
                    : ApprovalAction.ChangesRequested,
                Comments = request.Remarks,
            };
            _context.Set<ApprovalHistory>().Add(history);
        }

        await _context.SaveChangesAsync();

        return new HodProposalResponse
        {
            Id = proposal.Id,
            Title = proposal.Title,
            Abstract = proposal.Abstract,
            Status = request.Action,
            Remarks = request.Remarks,
            StudentName = proposal.Student?.FullName ?? "Unknown",
            StudentId = proposal.StudentId,
            Department = "",
            Version = 1,
            SubmittedAt = proposal.CreatedAt,
            ReviewedAt = DateTime.UtcNow,
            ReviewedByName = user?.FullName,
            Comments = new List<ProposalCommentItem>(),
        };
    }

    public async Task<ProposalCommentItem> AddCommentAsync(Guid userId, Guid proposalId, AddProposalCommentRequest request)
    {
        var proposal = await _context.Set<AIProposal>()
            .FirstOrDefaultAsync(p => p.Id == proposalId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Proposal not found");

        var user = await _context.Users.FindAsync(userId);
        var userName = user?.FullName ?? "Unknown";

        var history = new ApprovalHistory
        {
            ProjectId = proposal.Id,
            GuideId = userId,
            Action = ApprovalAction.ChangesRequested,
            Comments = request.Comment,
        };
        _context.Set<ApprovalHistory>().Add(history);
        await _context.SaveChangesAsync();

        return new ProposalCommentItem
        {
            Id = history.Id,
            Comment = request.Comment,
            UserName = userName,
            CreatedAt = history.CreatedAt,
        };
    }
}
