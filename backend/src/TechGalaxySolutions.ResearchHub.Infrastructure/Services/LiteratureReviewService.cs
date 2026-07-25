using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Literature;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.AI;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class LiteratureReviewService : ILiteratureReviewService
{
    private readonly ApplicationDbContext _context;
    private readonly AIProviderFactory _providerFactory;
    private readonly ILogger<LiteratureReviewService> _logger;

    public LiteratureReviewService(
        ApplicationDbContext context,
        AIProviderFactory providerFactory,
        ILogger<LiteratureReviewService> logger)
    {
        _context = context;
        _providerFactory = providerFactory;
        _logger = logger;
    }

    public async Task<UploadedDocumentResponse> UploadDocumentAsync(Guid userId, UploadDocumentRequest request)
    {
        var user = await _context.Set<User>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");

        var parseResult = LiteratureDocumentParser.Parse(request.Content, request.FileName, request.FileType);

        // Find or create literature review
        var review = await _context.Set<LiteratureReview>()
            .FirstOrDefaultAsync(l => l.StudentId == userId && l.ResearchArea == request.ResearchArea && l.Status == "Draft");

        if (review is null)
        {
            review = new LiteratureReview
            {
                StudentId = userId,
                Title = $"Literature Review - {request.ResearchArea}",
                ResearchArea = request.ResearchArea,
                Status = "Draft",
            };
            _context.Set<LiteratureReview>().Add(review);
            await _context.SaveChangesAsync();
        }

        var document = new UploadedDocument
        {
            LiteratureReviewId = review.Id,
            FileName = parseResult.FileName,
            FileType = parseResult.FileType,
            FileSize = request.Content.Length,
            StoragePath = "upload/" + Guid.NewGuid(),
            ExtractedText = request.Content,
            Title = parseResult.Title,
            Authors = parseResult.Authors,
            Abstract = parseResult.Abstract,
            Sections = parseResult.Sections,
            References = parseResult.References,
            Doi = parseResult.Doi,
            PublicationYear = parseResult.PublicationYear,
            Conference = parseResult.Conference,
            Journal = parseResult.Journal,
            UploadedByUserId = userId,
        };

        _context.Set<UploadedDocument>().Add(document);
        await _context.SaveChangesAsync();

        // Create chunks
        var chunks = ChunkText(request.Content, 2000);
        for (var i = 0; i < chunks.Count; i++)
        {
            _context.Set<DocumentChunk>().Add(new DocumentChunk
            {
                UploadedDocumentId = document.Id,
                ChunkIndex = i,
                Content = chunks[i],
                TokenCount = chunks[i].Split(' ').Length,
            });
        }
        await _context.SaveChangesAsync();

        return MapDocument(document);
    }

    public async Task<UploadedDocumentResponse> AnalyzeDocumentAsync(Guid userId, AnalyzeDocumentRequest request)
    {
        var doc = await _context.Set<UploadedDocument>()
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId && d.UploadedByUserId == userId)
            ?? throw new KeyNotFoundException("Document not found");

        var provider = _providerFactory.GetDefaultProvider();
        var text = doc.ExtractedText.Length > 8000 ? doc.ExtractedText[..8000] : doc.ExtractedText;

        var prompt = $@"You are a research paper analyst. Analyze the following paper and provide:

1. RESEARCH CONTRIBUTIONS - What novel contributions does this paper make?
2. METHODOLOGY SUMMARY - What research methodology was used?
3. STRENGTHS - What are the key strengths of this paper?
4. WEAKNESSES - What are the limitations or weaknesses?
5. LIMITATIONS - What limitations does the authors acknowledge?
6. FUTURE WORK - What future work is suggested?
7. NOVELTY SCORE - Rate 1-10 and explain why

RESEARCH AREA: {request.ResearchArea}

PAPER CONTENT:
{text}

Format with clear section headers using ### markers.";

        var aiRequest = new AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.5, MaxTokens = 4096 },
        };

        var response = await provider.SendAsync(aiRequest);

        doc.ResearchContributions = ExtractSection(response.Content, "RESEARCH CONTRIBUTIONS");
        doc.MethodologySummary = ExtractSection(response.Content, "METHODOLOGY SUMMARY");
        doc.Strengths = ExtractSection(response.Content, "STRENGTHS");
        doc.Weaknesses = ExtractSection(response.Content, "WEAKNESSES");
        doc.Limitations = ExtractSection(response.Content, "LIMITATIONS");
        doc.FutureWork = ExtractSection(response.Content, "FUTURE WORK");
        doc.NoveltyScore = ExtractSection(response.Content, "NOVELTY SCORE");

        // Save analysis history
        await SaveAnalysisHistory(doc.LiteratureReviewId, "Analyze", text, response.Content, provider.ProviderType.ToString());

        await _context.SaveChangesAsync();
        return MapDocument(doc);
    }

    public async Task<UploadedDocumentResponse> SummarizeDocumentAsync(Guid userId, SummarizeRequest request)
    {
        var doc = await _context.Set<UploadedDocument>()
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId && d.UploadedByUserId == userId)
            ?? throw new KeyNotFoundException("Document not found");

        var provider = _providerFactory.GetDefaultProvider();
        var text = doc.ExtractedText.Length > 8000 ? doc.ExtractedText[..8000] : doc.ExtractedText;

        var prompt = $@"You are a research paper summarizer. Generate a comprehensive summary of the following paper.

Include:
1. EXECUTIVE SUMMARY - 2-3 paragraph overview
2. KEY FINDINGS - Bullet points of main findings
3. MAIN CONCLUSION - What did the authors conclude?

PAPER CONTENT:
{text}

Format with ### markers.";

        var aiRequest = new AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.4, MaxTokens = 2048 },
        };

        var response = await provider.SendAsync(aiRequest);

        doc.Summary = response.Content;

        // Also update the parent literature review's executive summary
        var review = await _context.Set<LiteratureReview>().FirstOrDefaultAsync(l => l.Id == doc.LiteratureReviewId);
        if (review is not null)
        {
            review.ExecutiveSummary = string.IsNullOrEmpty(review.ExecutiveSummary)
                ? response.Content
                : review.ExecutiveSummary + "\n\n---\n\n" + response.Content;
        }

        await SaveAnalysisHistory(doc.LiteratureReviewId, "Summarize", text, response.Content, provider.ProviderType.ToString());

        await _context.SaveChangesAsync();
        return MapDocument(doc);
    }

    public async Task<LiteratureReviewResponse> CompareDocumentsAsync(Guid userId, CompareRequest request)
    {
        var docs = await _context.Set<UploadedDocument>()
            .Where(d => request.DocumentIds.Contains(d.Id) && d.UploadedByUserId == userId)
            .ToListAsync();

        if (docs.Count < 2)
            throw new InvalidOperationException("At least 2 documents are required for comparison");

        var provider = _providerFactory.GetDefaultProvider();
        var summaries = string.Join("\n\n---\n\n", docs.Select(d =>
            $"Paper: {d.Title ?? d.FileName}\nAbstract: {(d.Abstract ?? d.ExtractedText)[..Math.Min(1500, (d.Abstract ?? d.ExtractedText).Length)]}"));

        var prompt = $@"Compare the following research papers and provide:

1. COMPARISON TABLE - Create a markdown table comparing: Research Focus, Methodology, Key Findings, Strengths, Limitations
2. KEY DIFFERENCES - What are the major differences between these papers?
3. COMMON THEMES - What themes or approaches are common across papers?
4. COMPLEMENTARY ASPECTS - How do these papers complement each other?

PAPERS:
{summaries}

Format with ### markers.";

        var aiRequest = new AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.5, MaxTokens = 4096 },
        };

        var response = await provider.SendAsync(aiRequest);

        // Create or update review
        var reviewId = docs.First().LiteratureReviewId;
        var review = await _context.Set<LiteratureReview>()
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.Id == reviewId)
            ?? throw new KeyNotFoundException("Literature review not found");

        review.ComparisonResults = response.Content;
        await SaveAnalysisHistory(reviewId, "Compare", summaries, response.Content, provider.ProviderType.ToString());
        await _context.SaveChangesAsync();

        return MapReview(review);
    }

    public async Task<LiteratureReviewResponse> FindResearchGapsAsync(Guid userId, ResearchGapsRequest request)
    {
        var provider = _providerFactory.GetDefaultProvider();
        var existingWork = request.ExistingWorkSummary ?? "";

        if (request.LiteratureReviewId.HasValue)
        {
            var docs = await _context.Set<UploadedDocument>()
                .Where(d => d.LiteratureReviewId == request.LiteratureReviewId.Value)
                .ToListAsync();

            existingWork = string.Join("\n\n", docs.Select(d =>
                $"- {d.Title ?? d.FileName}: {(d.Abstract ?? d.ExtractedText)[..Math.Min(1000, (d.Abstract ?? d.ExtractedText).Length)]}"));
        }

        var prompt = $@"You are a research gap analyst. Based on the following existing work in {request.ResearchArea}, identify:

1. RESEARCH GAPS - List 5-7 specific research gaps not addressed by current work
2. OPPORTUNITIES - What research opportunities exist in these gaps?
3. RECOMMENDATIONS - Suggest specific research directions to address each gap
4. PRIORITY - Rate each gap as High/Medium/Low priority

EXISTING WORK:
{existingWork}

Format with ### markers.";

        var aiRequest = new AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.6, MaxTokens = 4096 },
        };

        var response = await provider.SendAsync(aiRequest);

        LiteratureReview review;
        if (request.LiteratureReviewId.HasValue)
        {
            review = await _context.Set<LiteratureReview>()
                .FirstOrDefaultAsync(l => l.Id == request.LiteratureReviewId.Value)
                ?? throw new KeyNotFoundException("Literature review not found");
        }
        else
        {
            review = new LiteratureReview
            {
                StudentId = userId,
                Title = $"Research Gaps - {request.ResearchArea}",
                ResearchArea = request.ResearchArea,
            };
            _context.Set<LiteratureReview>().Add(review);
        }

        review.ResearchGaps = response.Content;

        if (request.LiteratureReviewId.HasValue)
            await SaveAnalysisHistory(request.LiteratureReviewId.Value, "ResearchGaps", existingWork, response.Content, provider.ProviderType.ToString());

        await _context.SaveChangesAsync();
        return MapReview(review);
    }

    public async Task<UploadedDocumentResponse> ExtractKeywordsAsync(Guid userId, ExtractKeywordsRequest request)
    {
        var doc = await _context.Set<UploadedDocument>()
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId && d.UploadedByUserId == userId)
            ?? throw new KeyNotFoundException("Document not found");

        var provider = _providerFactory.GetDefaultProvider();
        var text = (doc.Abstract ?? doc.ExtractedText)[..Math.Min(5000, (doc.Abstract ?? doc.ExtractedText).Length)];

        var prompt = $@"Extract key terms from the following research paper.

Return a comma-separated list of 10-15 key terms covering: research domain, methodology, techniques, tools, and evaluation metrics.

Only return the keywords list, nothing else.

PAPER TEXT:
{text}";

        var aiRequest = new AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.3, MaxTokens = 500 },
        };

        var response = await provider.SendAsync(aiRequest);
        doc.Keywords = response.Content.Trim();

        await SaveAnalysisHistory(doc.LiteratureReviewId, "ExtractKeywords", text, response.Content, provider.ProviderType.ToString());
        await _context.SaveChangesAsync();

        return MapDocument(doc);
    }

    public async Task<LiteratureReviewResponse> GenerateRelatedWorkAsync(Guid userId, GenerateRelatedWorkRequest request)
    {
        var provider = _providerFactory.GetDefaultProvider();
        var summaries = request.DocumentSummaries ?? "";

        if (request.LiteratureReviewId.HasValue)
        {
            var docs = await _context.Set<UploadedDocument>()
                .Where(d => d.LiteratureReviewId == request.LiteratureReviewId.Value)
                .ToListAsync();

            summaries = string.Join("\n\n", docs.Select(d =>
                $"- {d.Title ?? d.FileName}: {(d.Summary ?? d.Abstract ?? d.ExtractedText)[..Math.Min(2000, (d.Summary ?? d.Abstract ?? d.ExtractedText).Length)]}"));
        }

        var prompt = $@"You are a research writer. Generate a comprehensive 'Related Work' section for a research paper in {request.ResearchArea}.

Based on the following papers, write an academic Related Work section that:
1. Groups related papers by theme/approach
2. Highlights evolution of research in this area
3. Identifies where current work differs from existing literature
4. Cites papers in proper academic format

SOURCES:
{summaries}

Write 3-5 paragraphs of formal academic text.";

        var aiRequest = new AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.6, MaxTokens = 4096 },
        };

        var response = await provider.SendAsync(aiRequest);

        LiteratureReview review;
        if (request.LiteratureReviewId.HasValue)
        {
            review = await _context.Set<LiteratureReview>()
                .FirstOrDefaultAsync(l => l.Id == request.LiteratureReviewId.Value)
                ?? throw new KeyNotFoundException("Literature review not found");
        }
        else
        {
            review = new LiteratureReview
            {
                StudentId = userId,
                Title = $"Related Work - {request.ResearchArea}",
                ResearchArea = request.ResearchArea,
            };
            _context.Set<LiteratureReview>().Add(review);
        }

        review.RelatedWork = response.Content;

        if (request.LiteratureReviewId.HasValue)
            await SaveAnalysisHistory(request.LiteratureReviewId.Value, "RelatedWork", summaries, response.Content, provider.ProviderType.ToString());

        await _context.SaveChangesAsync();
        return MapReview(review);
    }

    public async Task<List<LiteratureReviewResponse>> GetHistoryAsync(Guid userId)
    {
        var reviews = await _context.Set<LiteratureReview>().AsNoTracking()
            .Include(l => l.Documents)
            .Where(l => l.StudentId == userId && !l.IsDeleted)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return reviews.Select(MapReview).ToList();
    }

    public async Task<LiteratureReviewResponse> GetByIdAsync(Guid id, Guid userId)
    {
        var review = await _context.Set<LiteratureReview>().AsNoTracking()
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.Id == id && l.StudentId == userId)
            ?? throw new KeyNotFoundException("Literature review not found");

        return MapReview(review);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var review = await _context.Set<LiteratureReview>()
            .Include(l => l.Documents)
            .FirstOrDefaultAsync(l => l.Id == id && l.StudentId == userId)
            ?? throw new KeyNotFoundException("Literature review not found");

        review.IsDeleted = true;
        review.UpdatedAt = DateTime.UtcNow;

        foreach (var doc in review.Documents)
        {
            doc.IsDeleted = true;
            doc.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    private async Task SaveAnalysisHistory(Guid reviewId, string type, string input, string output, string provider)
    {
        _context.Set<AnalysisHistory>().Add(new AnalysisHistory
        {
            LiteratureReviewId = reviewId,
            AnalysisType = type,
            InputSummary = input.Length > 500 ? input[..500] : input,
            OutputContent = output.Length > 2000 ? output[..2000] : output,
            ProviderUsed = provider,
        });
        await _context.SaveChangesAsync();
    }

    private static List<string> ChunkText(string text, int chunkSize)
    {
        var chunks = new List<string>();
        for (var i = 0; i < text.Length; i += chunkSize)
            chunks.Add(text.Substring(i, Math.Min(chunkSize, text.Length - i)));
        return chunks;
    }

    private static string ExtractSection(string content, string sectionName)
    {
        var idx = content.IndexOf($"### {sectionName}", StringComparison.OrdinalIgnoreCase);
        if (idx < 0) idx = content.IndexOf($"## {sectionName}", StringComparison.OrdinalIgnoreCase);
        if (idx < 0) idx = content.IndexOf($"# {sectionName}", StringComparison.OrdinalIgnoreCase);
        if (idx < 0) idx = content.IndexOf(sectionName + ":", StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return string.Empty;

        var start = content.IndexOf('\n', idx);
        if (start < 0) return string.Empty;

        var end = content.IndexOf("\n### ", start, StringComparison.OrdinalIgnoreCase);
        if (end < 0) end = content.IndexOf("\n## ", start, StringComparison.OrdinalIgnoreCase);
        if (end < 0) end = content.IndexOf("\n# ", start, StringComparison.OrdinalIgnoreCase);
        if (end < 0) end = content.Length;

        return content[start..end].Trim();
    }

    private static UploadedDocumentResponse MapDocument(UploadedDocument d) => new()
    {
        Id = d.Id,
        FileName = d.FileName,
        FileType = d.FileType,
        FileSize = d.FileSize,
        Title = d.Title,
        Authors = d.Authors,
        Abstract = d.Abstract,
        Doi = d.Doi,
        PublicationYear = d.PublicationYear,
        Conference = d.Conference,
        Journal = d.Journal,
        Summary = d.Summary,
        Keywords = d.Keywords,
        ResearchContributions = d.ResearchContributions,
        MethodologySummary = d.MethodologySummary,
        Strengths = d.Strengths,
        Weaknesses = d.Weaknesses,
        Limitations = d.Limitations,
        FutureWork = d.FutureWork,
        NoveltyScore = d.NoveltyScore,
        CreatedAt = d.CreatedAt,
    };

    private static LiteratureReviewResponse MapReview(LiteratureReview r) => new()
    {
        Id = r.Id,
        Title = r.Title,
        ResearchArea = r.ResearchArea,
        ExecutiveSummary = r.ExecutiveSummary,
        ResearchGaps = r.ResearchGaps,
        RelatedWork = r.RelatedWork,
        ComparisonResults = r.ComparisonResults,
        Status = r.Status ?? "Draft",
        DocumentCount = r.Documents?.Count ?? 0,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt,
        Documents = r.Documents?.Select(MapDocument).ToList() ?? new(),
    };
}
