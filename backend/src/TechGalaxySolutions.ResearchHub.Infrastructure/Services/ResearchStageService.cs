using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchStage;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ResearchStageService : IResearchStageService
{
    private static readonly (string Name, string Description)[] DefaultStages =
    {
        ("Admission / Registered", "Scholar admitted and registered"),
        ("Coursework", "Undertaking coursework papers"),
        ("Coursework Completed", "Coursework credits and papers completed"),
        ("Research Proposal", "Preparing research proposal"),
        ("Proposal Approved", "Research proposal approved"),
        ("Research in Progress", "Actively conducting research"),
        ("Publication / Paper Work", "Working on publications and papers"),
        ("Pre-Submission", "Preparing thesis for submission"),
        ("Thesis Submitted", "Thesis submitted for evaluation"),
        ("Viva", "Viva-voce examination in progress"),
        ("Completed", "Degree completed"),
    };

    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ResearchStageService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ResearchStageResponse>> GetAllAsync()
    {
        await EnsureProvisionedAsync();
        var stages = await _context.Set<ResearchStage>().AsNoTracking()
            .Where(rs => !rs.IsDeleted)
            .OrderBy(rs => rs.SortOrder)
            .ToListAsync();
        return _mapper.Map<List<ResearchStageResponse>>(stages);
    }

    public async Task<ResearchStageResponse> GetByIdAsync(Guid id)
    {
        var stage = await _context.Set<ResearchStage>().AsNoTracking()
            .FirstOrDefaultAsync(rs => rs.Id == id && !rs.IsDeleted)
            ?? throw new KeyNotFoundException("Research stage not found");
        return _mapper.Map<ResearchStageResponse>(stage);
    }

    public async Task<ResearchStageResponse> CreateAsync(CreateResearchStageRequest request)
    {
        var existing = await _context.Set<ResearchStage>().AsNoTracking()
            .AnyAsync(rs => rs.Name == request.Name && !rs.IsDeleted);
        if (existing)
            throw new InvalidOperationException("A research stage with this name already exists");

        var stage = new ResearchStage
        {
            Name = request.Name,
            Description = request.Description,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
        };
        _context.Set<ResearchStage>().Add(stage);
        await _context.SaveChangesAsync();
        return _mapper.Map<ResearchStageResponse>(stage);
    }

    public async Task<ResearchStageResponse> UpdateAsync(Guid id, UpdateResearchStageRequest request)
    {
        var stage = await _context.Set<ResearchStage>()
            .FirstOrDefaultAsync(rs => rs.Id == id && !rs.IsDeleted)
            ?? throw new KeyNotFoundException("Research stage not found");

        var duplicate = await _context.Set<ResearchStage>().AsNoTracking()
            .AnyAsync(rs => rs.Name == request.Name && rs.Id != id && !rs.IsDeleted);
        if (duplicate)
            throw new InvalidOperationException("A research stage with this name already exists");

        stage.Name = request.Name;
        stage.Description = request.Description;
        stage.SortOrder = request.SortOrder;
        stage.IsActive = request.IsActive;
        stage.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return _mapper.Map<ResearchStageResponse>(stage);
    }

    public async Task DeleteAsync(Guid id)
    {
        var stage = await _context.Set<ResearchStage>()
            .FirstOrDefaultAsync(rs => rs.Id == id && !rs.IsDeleted)
            ?? throw new KeyNotFoundException("Research stage not found");

        var inUse = await _context.Set<StudentProfile>().AsNoTracking()
            .AnyAsync(sp => sp.ResearchStageId == id && !sp.IsDeleted);
        if (inUse)
            throw new InvalidOperationException("Cannot delete a research stage assigned to scholars");

        stage.IsDeleted = true;
        stage.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task EnsureProvisionedAsync()
    {
        var existing = await _context.Set<ResearchStage>().AsNoTracking()
            .Where(rs => !rs.IsDeleted)
            .Select(rs => rs.Name)
            .ToListAsync();

        var changed = false;
        for (var i = 0; i < DefaultStages.Length; i++)
        {
            var (name, description) = DefaultStages[i];
            if (existing.Contains(name))
                continue;

            _context.Set<ResearchStage>().Add(new ResearchStage
            {
                Name = name,
                Description = description,
                SortOrder = i + 1,
            });
            changed = true;
        }

        if (changed)
            await _context.SaveChangesAsync();
    }
}
