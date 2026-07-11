using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Proposal;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.AI;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ProposalGeneratorService : IProposalGeneratorService
{
    private readonly ApplicationDbContext _context;
    private readonly AIProviderFactory _providerFactory;
    private readonly ILogger<ProposalGeneratorService> _logger;

    public ProposalGeneratorService(
        ApplicationDbContext context,
        AIProviderFactory providerFactory,
        ILogger<ProposalGeneratorService> logger)
    {
        _context = context;
        _providerFactory = providerFactory;
        _logger = logger;
    }

    public async Task<List<ProposalTemplateResponse>> GetTemplatesAsync()
    {
        return new List<ProposalTemplateResponse>
        {
            new() { Name = "Engineering Research", Description = "Standard engineering research proposal", ResearchArea = "Engineering", Difficulty = "Intermediate", Duration = "6 Months", Keywords = "design, analysis, optimization" },
            new() { Name = "Computer Science Project", Description = "Software/computing research proposal", ResearchArea = "Computer Science", Difficulty = "Intermediate", Duration = "4 Months", Keywords = "software, algorithms, data" },
            new() { Name = "Medical Research", Description = "Clinical/medical research proposal", ResearchArea = "Medical", Difficulty = "Advanced", Duration = "12 Months", Keywords = "clinical, patient, treatment" },
            new() { Name = "Business Management", Description = "MBA/management research proposal", ResearchArea = "MBA", Difficulty = "Intermediate", Duration = "6 Months", Keywords = "strategy, market, organization" },
            new() { Name = "IT Infrastructure", Description = "Information technology research proposal", ResearchArea = "IT", Difficulty = "Intermediate", Duration = "6 Months", Keywords = "network, security, systems" },
        };
    }

    public async Task<ProposalResponse> GenerateAsync(Guid studentId, GenerateProposalRequest request)
    {
        var user = await _context.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == studentId)
            ?? throw new KeyNotFoundException("Student not found");

        var provider = _providerFactory.GetDefaultProvider();
        var prompt = PromptBuilder.BuildGeneratePrompt(new GenerateContext
        {
            ResearchArea = request.ResearchArea,
            Keywords = request.Keywords,
            Difficulty = request.Difficulty,
            Duration = request.Duration,
            AdditionalContext = request.AdditionalContext,
        });

        _logger.LogInformation("Generating proposal for {ResearchArea} by student {StudentId}", request.ResearchArea, studentId);

        var aiRequest = new Application.DTOs.AI.AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.7, MaxTokens = 4096, Model = "" },
        };

        var aiResponse = await provider.SendAsync(aiRequest);

        var proposal = ParseProposal(aiResponse.Content, request, studentId);
        proposal.Status = "Draft";

        _context.Set<AIProposal>().Add(proposal);
        await _context.SaveChangesAsync();

        return MapToResponse(proposal);
    }

    public async Task<ProposalResponse> ImproveSectionAsync(Guid userId, ImproveProposalRequest request)
    {
        var provider = _providerFactory.GetDefaultProvider();
        var prompt = PromptBuilder.BuildImprovePrompt(request.SectionName, request.SectionContent, request.ImprovementType, request.ResearchArea);

        var aiRequest = new Application.DTOs.AI.AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.5, MaxTokens = 2048, Model = "" },
        };

        var aiResponse = await provider.SendAsync(aiRequest);

        return new ProposalResponse
        {
            Title = request.SectionName,
            ResearchArea = request.ResearchArea,
            Abstract = aiResponse.Content,
        };
    }

    public async Task<ProposalResponse> RegenerateSectionAsync(Guid userId, RegenerateSectionRequest request)
    {
        var proposal = await _context.Set<AIProposal>()
            .FirstOrDefaultAsync(p => p.Id == request.ProposalId && p.StudentId == userId)
            ?? throw new KeyNotFoundException("Proposal not found");

        var provider = _providerFactory.GetDefaultProvider();
        var prompt = PromptBuilder.BuildRegeneratePrompt(request.SectionName, request.ResearchArea, request.Keywords);

        var aiRequest = new Application.DTOs.AI.AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.7, MaxTokens = 2048, Model = "" },
        };

        var aiResponse = await provider.SendAsync(aiRequest);
        var newContent = aiResponse.Content;

        UpdateSection(proposal, request.SectionName, newContent);
        proposal.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToResponse(proposal);
    }

    public async Task<ProposalResponse> SaveAsync(Guid studentId, SaveProposalRequest request)
    {
        var proposal = new AIProposal
        {
            StudentId = studentId,
            Title = request.Title,
            ResearchArea = request.ResearchArea,
            Keywords = request.Keywords,
            Difficulty = request.Difficulty,
            Duration = request.Duration,
            Abstract = request.Abstract,
            Objectives = request.Objectives,
            ProblemStatement = request.ProblemStatement,
            Scope = request.Scope,
            LiteratureReview = request.LiteratureReview,
            Methodology = request.Methodology,
            ExpectedOutcome = request.ExpectedOutcome,
            Timeline = request.Timeline,
            RequiredTools = request.RequiredTools,
            ExpectedResult = request.ExpectedResult,
            FutureScope = request.FutureScope,
            References = request.References,
            Status = "Completed",
        };

        _context.Set<AIProposal>().Add(proposal);
        await _context.SaveChangesAsync();

        return MapToResponse(proposal);
    }

    public async Task<ProposalResponse> GetByIdAsync(Guid id, Guid userId)
    {
        var proposal = await _context.Set<AIProposal>().AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.StudentId == userId)
            ?? throw new KeyNotFoundException("Proposal not found");

        return MapToResponse(proposal);
    }

    public async Task<List<ProposalResponse>> GetByStudentIdAsync(Guid studentId)
    {
        var proposals = await _context.Set<AIProposal>().AsNoTracking()
            .Where(p => p.StudentId == studentId && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return proposals.Select(MapToResponse).ToList();
    }

    public async Task<ProposalResponse> UpdateAsync(Guid id, Guid userId, SaveProposalRequest request)
    {
        var proposal = await _context.Set<AIProposal>()
            .FirstOrDefaultAsync(p => p.Id == id && p.StudentId == userId)
            ?? throw new KeyNotFoundException("Proposal not found");

        proposal.Title = request.Title;
        proposal.ResearchArea = request.ResearchArea;
        proposal.Keywords = request.Keywords;
        proposal.Difficulty = request.Difficulty;
        proposal.Duration = request.Duration;
        proposal.Abstract = request.Abstract;
        proposal.Objectives = request.Objectives;
        proposal.ProblemStatement = request.ProblemStatement;
        proposal.Scope = request.Scope;
        proposal.LiteratureReview = request.LiteratureReview;
        proposal.Methodology = request.Methodology;
        proposal.ExpectedOutcome = request.ExpectedOutcome;
        proposal.Timeline = request.Timeline;
        proposal.RequiredTools = request.RequiredTools;
        proposal.ExpectedResult = request.ExpectedResult;
        proposal.FutureScope = request.FutureScope;
        proposal.References = request.References;
        proposal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToResponse(proposal);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var proposal = await _context.Set<AIProposal>()
            .FirstOrDefaultAsync(p => p.Id == id && p.StudentId == userId)
            ?? throw new KeyNotFoundException("Proposal not found");

        proposal.IsDeleted = true;
        proposal.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private static AIProposal ParseProposal(string aiContent, GenerateProposalRequest request, Guid studentId)
    {
        var proposal = new AIProposal
        {
            StudentId = studentId,
            ResearchArea = request.ResearchArea,
            Keywords = request.Keywords,
            Difficulty = request.Difficulty,
            Duration = request.Duration,
            Title = ExtractSection(aiContent, "RESEARCH TITLE"),
            Abstract = ExtractSection(aiContent, "ABSTRACT"),
            Objectives = ExtractSection(aiContent, "OBJECTIVES"),
            ProblemStatement = ExtractSection(aiContent, "PROBLEM STATEMENT"),
            Scope = ExtractSection(aiContent, "SCOPE"),
            LiteratureReview = ExtractSection(aiContent, "LITERATURE REVIEW"),
            Methodology = ExtractSection(aiContent, "METHODOLOGY"),
            ExpectedOutcome = ExtractSection(aiContent, "EXPECTED OUTCOME"),
            Timeline = ExtractSection(aiContent, "TIMELINE"),
            RequiredTools = ExtractSection(aiContent, "REQUIRED TOOLS"),
            ExpectedResult = ExtractSection(aiContent, "EXPECTED RESULT"),
            FutureScope = ExtractSection(aiContent, "FUTURE SCOPE"),
            References = ExtractSection(aiContent, "REFERENCES"),
        };

        if (string.IsNullOrEmpty(proposal.Title))
            proposal.Title = ExtractSection(aiContent, "TITLE");

        return proposal;
    }

    private static string ExtractSection(string content, string sectionName)
    {
        var patterns = new[]
        {
            $"### {sectionName}",
            $"## {sectionName}",
            $"# {sectionName}",
            $"{sectionName}:",
            $"{sectionName}\n",
        };

        foreach (var pattern in patterns)
        {
            var idx = content.IndexOf(pattern, StringComparison.OrdinalIgnoreCase);
            if (idx < 0) continue;

            var start = idx + pattern.Length;
            // Find next section header
            var nextSection = FindNextSection(content, start);
            var section = nextSection > start ? content[start..nextSection].Trim() : content[start..].Trim();

            // Clean up leading newlines/markdown
            section = section.TrimStart('\n', '\r', ' ', '-', '=', '#');
            return section.Trim();
        }

        return string.Empty;
    }

    private static int FindNextSection(string content, int fromIndex)
    {
        var minIndex = int.MaxValue;
        var markers = new[] { "### ", "## ", "# ", "\n##", "\n#" };

        foreach (var marker in markers)
        {
            var idx = content.IndexOf(marker, fromIndex, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0 && idx < minIndex)
                minIndex = idx;
        }

        return minIndex == int.MaxValue ? content.Length : minIndex;
    }

    private static void UpdateSection(AIProposal proposal, string sectionName, string content)
    {
        switch (sectionName.ToLowerInvariant())
        {
            case "title":
            case "research title": proposal.Title = content; break;
            case "abstract": proposal.Abstract = content; break;
            case "objectives": proposal.Objectives = content; break;
            case "problem statement":
            case "problem": proposal.ProblemStatement = content; break;
            case "scope": proposal.Scope = content; break;
            case "literature review": proposal.LiteratureReview = content; break;
            case "methodology": proposal.Methodology = content; break;
            case "expected outcome": proposal.ExpectedOutcome = content; break;
            case "timeline": proposal.Timeline = content; break;
            case "required tools": proposal.RequiredTools = content; break;
            case "expected result": proposal.ExpectedResult = content; break;
            case "future scope": proposal.FutureScope = content; break;
            case "references": proposal.References = content; break;
        }
    }

    private static ProposalResponse MapToResponse(AIProposal p) => new()
    {
        Id = p.Id,
        StudentId = p.StudentId,
        Title = p.Title,
        ResearchArea = p.ResearchArea,
        Keywords = p.Keywords,
        Difficulty = p.Difficulty,
        Duration = p.Duration,
        Abstract = p.Abstract,
        Objectives = p.Objectives,
        ProblemStatement = p.ProblemStatement,
        Scope = p.Scope,
        LiteratureReview = p.LiteratureReview,
        Methodology = p.Methodology,
        ExpectedOutcome = p.ExpectedOutcome,
        Timeline = p.Timeline,
        RequiredTools = p.RequiredTools,
        ExpectedResult = p.ExpectedResult,
        FutureScope = p.FutureScope,
        References = p.References,
        Status = p.Status,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt,
    };
}
