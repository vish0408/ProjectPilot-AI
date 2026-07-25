using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.DTOs.AI;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Chat;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.AI;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ChatService : IChatService
{
    private readonly ApplicationDbContext _context;
    private readonly AIProviderFactory _providerFactory;
    private readonly ILogger<ChatService> _logger;

    private const int MaxContextTokens = 12000;
    private const int MaxHistoryMessages = 10;

    public ChatService(
        ApplicationDbContext context,
        AIProviderFactory providerFactory,
        ILogger<ChatService> logger)
    {
        _context = context;
        _providerFactory = providerFactory;
        _logger = logger;
    }

    public async Task<ChatSessionResponse> CreateSessionAsync(Guid userId, CreateSessionRequest request)
    {
        var session = new ChatSession
        {
            Title = request.Title,
            StudentId = userId,
            ProjectId = request.ProjectId,
            ResearchArea = request.ResearchArea,
            LastActivityAt = DateTime.UtcNow,
        };

        _context.Set<ChatSession>().Add(session);
        await _context.SaveChangesAsync();

        return MapSession(session);
    }

    public async Task<ChatMessageResponse> SendMessageAsync(Guid userId, SendMessageRequest request)
    {
        var session = await _context.Set<ChatSession>()
            .Include(s => s.Messages.Where(m => !m.IsDeleted))
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.StudentId == userId)
            ?? throw new KeyNotFoundException("Chat session not found");

        // Save user message
        var userMsg = new ChatMessage
        {
            ChatSessionId = session.Id,
            Role = "user",
            Content = request.Message,
            OrderIndex = session.Messages.Count,
        };
        _context.Set<ChatMessage>().Add(userMsg);
        await _context.SaveChangesAsync();

        // RAG Pipeline
        var retrievedContext = await RetrieveContextAsync(request.Message, userId);
        var conversationHistory = BuildConversationHistory(session.Messages, userMsg);
        var prompt = BuildRagPrompt(request.Message, retrievedContext, conversationHistory);

        var provider = _providerFactory.GetDefaultProvider();

        var aiRequest = new AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.5, MaxTokens = 4096 },
        };

        var response = await provider.SendAsync(aiRequest);

        // Save assistant message
        var assistantMsg = new ChatMessage
        {
            ChatSessionId = session.Id,
            Role = "assistant",
            Content = response.Content,
            Confidence = ExtractConfidence(response.Content),
            PromptTokens = response.Usage?.PromptTokens,
            CompletionTokens = response.Usage?.CompletionTokens,
            ProviderUsed = provider.ProviderType.ToString(),
            OrderIndex = session.Messages.Count + 1,
        };
        _context.Set<ChatMessage>().Add(assistantMsg);

        // Save citations
        if (retrievedContext.Count > 0)
        {
            foreach (var doc in retrievedContext.Take(5))
            {
                _context.Set<Citation>().Add(new Citation
                {
                    ChatMessageId = assistantMsg.Id,
                    SourceTitle = doc.DocumentTitle ?? "Untitled",
                    SourceType = doc.SourceType,
                    SectionName = doc.SectionName,
                    Excerpt = doc.ChunkContent.Length > 300 ? doc.ChunkContent[..300] : doc.ChunkContent,
                    RelevanceScore = doc.RelevanceScore,
                });
            }
        }

        // Update session
        session.LastActivityAt = DateTime.UtcNow;
        session.MessageCount = session.Messages.Count + 2;
        if (string.IsNullOrEmpty(session.ContextSummary))
            session.ContextSummary = retrievedContext.Count > 0
                ? $"References: {retrievedContext.Select(r => r.DocumentTitle).Distinct().Take(3).Aggregate((a, b) => $"{a}, {b}")}"
                : "No references used";

        await _context.SaveChangesAsync();

        return MapMessage(assistantMsg);
    }

    public async IAsyncEnumerable<ChatStreamChunk> StreamMessageAsync(
        Guid userId, SendMessageRequest request,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var session = await _context.Set<ChatSession>()
            .Include(s => s.Messages.Where(m => !m.IsDeleted))
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.StudentId == userId, cancellationToken);

        if (session is null)
        {
            yield return new ChatStreamChunk { Error = "Chat session not found", IsComplete = true };
            yield break;
        }

        // Save user message
        var userMsg = new ChatMessage
        {
            ChatSessionId = session.Id,
            Role = "user",
            Content = request.Message,
            OrderIndex = session.Messages.Count,
        };
        _context.Set<ChatMessage>().Add(userMsg);
        await _context.SaveChangesAsync(cancellationToken);

        // Retrieve context
        var retrievedContext = await RetrieveContextAsync(request.Message, userId);
        var conversationHistory = BuildConversationHistory(session.Messages, userMsg);
        var prompt = BuildRagPrompt(request.Message, retrievedContext, conversationHistory);

        var provider = _providerFactory.GetDefaultProvider();

        var aiRequest = new AIRequest
        {
            Messages = new() { new() { Role = "user", Content = prompt } },
            Options = new() { Temperature = 0.5, MaxTokens = 4096 },
        };

        var fullContent = new System.Text.StringBuilder();

        var stream = provider.StreamAsync(aiRequest, cancellationToken);
        var enumerator = stream.GetAsyncEnumerator(cancellationToken);

        await using var _ = enumerator.ConfigureAwait(false);

        while (true)
        {
            try
            {
                if (!await enumerator.MoveNextAsync())
                    break;
            }
            catch (OperationCanceledException)
            {
                yield break;
            }

            var chunk = enumerator.Current;
            fullContent.Append(chunk.Content);
            yield return new ChatStreamChunk
            {
                Content = chunk.Content,
                IsComplete = false,
            };
        }

        var content = fullContent.ToString();

        // Save assistant message
        var assistantMsg = new ChatMessage
        {
            ChatSessionId = session.Id,
            Role = "assistant",
            Content = content,
            Confidence = ExtractConfidence(content),
            ProviderUsed = provider.ProviderType.ToString(),
            OrderIndex = session.Messages.Count + 1,
        };
        _context.Set<ChatMessage>().Add(assistantMsg);

        // Save citations
        if (retrievedContext.Count > 0)
        {
            foreach (var doc in retrievedContext.Take(5))
            {
                _context.Set<Citation>().Add(new Citation
                {
                    ChatMessageId = assistantMsg.Id,
                    SourceTitle = doc.DocumentTitle ?? "Untitled",
                    SourceType = doc.SourceType,
                    SectionName = doc.SectionName,
                    Excerpt = doc.ChunkContent.Length > 300 ? doc.ChunkContent[..300] : doc.ChunkContent,
                    RelevanceScore = doc.RelevanceScore,
                });
            }
        }

        session.LastActivityAt = DateTime.UtcNow;
        session.MessageCount = session.Messages.Count + 2;

        await _context.SaveChangesAsync(cancellationToken);

        // Load citations to return
        var citations = await _context.Set<Citation>()
            .Where(c => c.ChatMessageId == assistantMsg.Id)
            .ToListAsync(cancellationToken);

        await _context.Entry(assistantMsg).Collection(m => m.Citations).LoadAsync(cancellationToken);

        yield return new ChatStreamChunk
        {
            Content = string.Empty,
            IsComplete = true,
            MessageId = assistantMsg.Id,
            Confidence = ExtractConfidence(content),
        };
    }

    public async Task<List<ChatSessionResponse>> GetHistoryAsync(Guid userId)
    {
        var sessions = await _context.Set<ChatSession>().AsNoTracking()
            .Where(s => s.StudentId == userId && !s.IsDeleted)
            .OrderByDescending(s => s.LastActivityAt)
            .Select(s => new ChatSessionResponse
            {
                Id = s.Id,
                Title = s.Title,
                ResearchArea = s.ResearchArea,
                MessageCount = s.MessageCount,
                CreatedAt = s.CreatedAt,
                LastActivityAt = s.LastActivityAt,
            })
            .ToListAsync();

        return sessions;
    }

    public async Task<ChatSessionDetailResponse> GetSessionAsync(Guid sessionId, Guid userId)
    {
        var session = await _context.Set<ChatSession>().AsNoTracking()
            .Include(s => s.Messages.Where(m => !m.IsDeleted).OrderBy(m => m.OrderIndex))
                .ThenInclude(m => m.Citations)
            .Include(s => s.DocumentReferences)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.StudentId == userId)
            ?? throw new KeyNotFoundException("Chat session not found");

        return new ChatSessionDetailResponse
        {
            Id = session.Id,
            Title = session.Title,
            ResearchArea = session.ResearchArea,
            ContextSummary = session.ContextSummary,
            MessageCount = session.MessageCount,
            CreatedAt = session.CreatedAt,
            LastActivityAt = session.LastActivityAt,
            Messages = session.Messages.Select(MapMessage).ToList(),
            DocumentReferences = session.DocumentReferences.Select(d => new DocumentReferenceResponse
            {
                Id = d.Id,
                SourceType = d.SourceType,
                Title = d.Title,
                Authors = d.Authors,
                Year = d.Year,
                Summary = d.Summary,
            }).ToList(),
        };
    }

    public async Task DeleteSessionAsync(Guid sessionId, Guid userId)
    {
        var session = await _context.Set<ChatSession>()
            .Include(s => s.Messages)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.StudentId == userId)
            ?? throw new KeyNotFoundException("Chat session not found");

        session.IsDeleted = true;
        session.UpdatedAt = DateTime.UtcNow;

        foreach (var msg in session.Messages)
        {
            msg.IsDeleted = true;
            msg.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    // ===== RAG Pipeline =====

    private async Task<List<RetrievedDocument>> RetrieveContextAsync(string question, Guid userId)
    {
        var results = new List<RetrievedDocument>();

        // Phase 1: Retrieve from uploaded documents
        var docs = await _context.Set<UploadedDocument>().AsNoTracking()
            .Where(d => d.UploadedByUserId == userId && !d.IsDeleted)
            .ToListAsync();

        foreach (var doc in docs)
        {
            if (!string.IsNullOrEmpty(doc.ExtractedText))
                results.Add(new RetrievedDocument
                {
                    DocumentId = doc.Id.ToString(),
                    DocumentTitle = doc.Title ?? doc.FileName,
                    ChunkContent = doc.ExtractedText.Length > 2000 ? doc.ExtractedText[..2000] : doc.ExtractedText,
                    SectionName = "Full Document",
                    SourceType = "Literature",
                    RelevanceScore = 0.5,
                });

            if (!string.IsNullOrEmpty(doc.Abstract))
                results.Add(new RetrievedDocument
                {
                    DocumentId = doc.Id.ToString(),
                    DocumentTitle = doc.Title ?? doc.FileName,
                    ChunkContent = doc.Abstract,
                    SectionName = "Abstract",
                    SourceType = "Literature",
                    RelevanceScore = 0.6,
                });
        }

        // Retrieve document chunks
        var chunks = await _context.Set<DocumentChunk>().AsNoTracking()
            .Include(c => c.UploadedDocument)
            .Where(c => c.UploadedDocument!.UploadedByUserId == userId && !c.UploadedDocument.IsDeleted)
            .OrderBy(c => c.UploadedDocumentId)
            .ThenBy(c => c.ChunkIndex)
            .Take(100)
            .ToListAsync();

        foreach (var chunk in chunks)
        {
            results.Add(new RetrievedDocument
            {
                DocumentId = chunk.UploadedDocumentId.ToString(),
                DocumentTitle = chunk.UploadedDocument?.Title ?? chunk.UploadedDocument?.FileName ?? "Document",
                ChunkContent = chunk.Content,
                SectionName = chunk.SectionName ?? $"Section {chunk.ChunkIndex}",
                SourceType = "Chunk",
                RelevanceScore = 0.4,
            });
        }

        // Retrieve proposals
        var proposals = await _context.Set<AIProposal>().AsNoTracking()
            .Where(p => p.StudentId == userId && !p.IsDeleted)
            .ToListAsync();

        foreach (var proposal in proposals.Take(3))
        {
            var proposalText = $@"Title: {proposal.Title}
Domain: {proposal.ResearchArea}
Abstract: {proposal.Abstract}
Methodology: {proposal.Methodology}
Literature: {proposal.LiteratureReview}";

            results.Add(new RetrievedDocument
            {
                DocumentId = proposal.Id.ToString(),
                DocumentTitle = $"Proposal: {proposal.Title}",
                ChunkContent = proposalText.Length > 3000 ? proposalText[..3000] : proposalText,
                SectionName = "Project Proposal",
                SourceType = "Proposal",
                RelevanceScore = 0.7,
            });
        }

        // Phase 2: Rank by keyword relevance
        var keywords = ExtractKeywords(question);
        foreach (var result in results)
        {
            var score = CalculateRelevance(question, keywords, result.ChunkContent);
            result.RelevanceScore = score;
        }

        // Phase 3: Top-K selection with context window management
        var ranked = results
            .Where(r => r.RelevanceScore > 0.1)
            .OrderByDescending(r => r.RelevanceScore)
            .Take(10)
            .ToList();

        // Manage context window: truncate to fit token budget
        var totalChars = 0;
        var contextBudget = MaxContextTokens * 4;
        var finalResults = new List<RetrievedDocument>();

        foreach (var item in ranked)
        {
            var itemChars = item.ChunkContent.Length + item.DocumentTitle.Length;
            if (totalChars + itemChars > contextBudget) break;
            finalResults.Add(item);
            totalChars += itemChars;
        }

        return finalResults;
    }

    private static string BuildConversationHistory(IEnumerable<ChatMessage> messages, ChatMessage currentUserMsg)
    {
        var ordered = messages
            .Where(m => m.Id != currentUserMsg.Id)
            .OrderByDescending(m => m.OrderIndex)
            .Take(MaxHistoryMessages)
            .OrderBy(m => m.OrderIndex)
            .ToList();

        if (ordered.Count == 0) return string.Empty;

        var history = new System.Text.StringBuilder();
        foreach (var msg in ordered)
        {
            history.AppendLine($"{msg.Role.ToUpper()}: {msg.Content[..Math.Min(500, msg.Content.Length)]}");
        }
        return history.ToString();
    }

    private static string BuildRagPrompt(string question, List<RetrievedDocument> context, string conversationHistory)
    {
        var sb = new System.Text.StringBuilder();

        sb.AppendLine(@"You are an AI Research Assistant helping a student with their research project.
Answer questions based on the provided context from their research papers, proposals, and documents.

Guidelines:
- Base answers strictly on the provided context
- If the context doesn't contain relevant information, say so honestly
- Cite specific papers and sections when referencing information
- Format answers with markdown for readability
- Use bullet points for lists, tables for comparisons, and code blocks for technical content
- Math formulas should use LaTeX notation $$...$$
- When discussing algorithms, explain step by step
- Provide confidence assessment at the end

Available Research Context:");

        // Phase 3: Retrieved Context
        if (context.Count > 0)
        {
            sb.AppendLine("\n=== RETRIEVED DOCUMENTS ===");
            foreach (var doc in context)
            {
                sb.AppendLine($"\n--- Document: {doc.DocumentTitle} | Section: {doc.SectionName} | Source: {doc.SourceType} ---");
                sb.AppendLine(doc.ChunkContent);
            }
        }
        else
        {
            sb.AppendLine("\nNo contextual documents found. Answer based on general knowledge.");
        }

        // Phase 3: Conversation History
        if (!string.IsNullOrEmpty(conversationHistory))
        {
            sb.AppendLine("\n=== CONVERSATION HISTORY ===");
            sb.AppendLine(conversationHistory);
        }

        // Phase 3: User Question
        sb.AppendLine("\n=== USER QUESTION ===");
        sb.AppendLine(question);

        sb.AppendLine("\n=== RESPONSE ===");
        sb.AppendLine("Provide your answer below. Include relevant citations as [Source: Document Title, Section]. End with a confidence level: **Confidence: High/Medium/Low** based on how well the context supports your answer.");

        return sb.ToString();
    }

    private static List<string> ExtractKeywords(string text)
    {
        var stopWords = new HashSet<string> { "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "with", "and", "or", "but", "this", "that", "it", "its", "what", "how", "why", "when", "where", "which", "who", "whose", "can", "will", "may", "could", "would", "should", "has", "have", "had", "been", "being", "do", "does", "did", "done", "about", "into", "through", "during", "before", "after", "above", "below", "between", "under", "again", "further", "then", "once", "here", "there", "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just", "because", "as", "until", "while", "of", "at", "by", "from", "up", "down", "off", "over", "out", "etc" };

        return text.ToLower()
            .Split(new[] { ' ', ',', '.', ';', ':', '!', '?', '(', ')', '[', ']', '{', '}', '"', '\'', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 3 && !stopWords.Contains(w))
            .Distinct()
            .ToList();
    }

    private static double CalculateRelevance(string question, List<string> keywords, string content)
    {
        if (string.IsNullOrEmpty(content) || keywords.Count == 0) return 0;

        var lowerContent = content.ToLower();
        var matchCount = keywords.Count(k => lowerContent.Contains(k));
        var score = (double)matchCount / keywords.Count;

        // Bonus for title/section matches
        if (keywords.Any(k => question.ToLower().Contains(k) && lowerContent.Contains(k)))
            score += 0.2;

        // Bonus for exact phrase matches
        var questionWords = question.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var phraseMatchCount = 0;
        for (var i = 0; i < questionWords.Length - 1; i++)
        {
            var bigram = questionWords[i] + " " + questionWords[i + 1];
            if (lowerContent.Contains(bigram))
                phraseMatchCount++;
        }
        if (questionWords.Length > 1)
            score += 0.1 * (double)phraseMatchCount / (questionWords.Length - 1);

        return Math.Min(score, 1.0);
    }

    private static string? ExtractConfidence(string content)
    {
        var lines = content.Split('\n');
        foreach (var line in lines)
        {
            var trimmed = line.Trim().TrimStart('#', '*');
            if (trimmed.StartsWith("Confidence:", StringComparison.OrdinalIgnoreCase))
                return trimmed["Confidence:".Length..].Trim();
        }
        return null;
    }

    private static ChatSessionResponse MapSession(ChatSession s) => new()
    {
        Id = s.Id,
        Title = s.Title,
        ResearchArea = s.ResearchArea,
        MessageCount = s.MessageCount,
        CreatedAt = s.CreatedAt,
        LastActivityAt = s.LastActivityAt,
    };

    private static ChatMessageResponse MapMessage(ChatMessage m) => new()
    {
        Id = m.Id,
        Role = m.Role,
        Content = m.Content,
        Confidence = m.Confidence,
        OrderIndex = m.OrderIndex,
        CreatedAt = m.CreatedAt,
        Citations = m.Citations?.Select(c => new CitationResponse
        {
            Id = c.Id,
            SourceTitle = c.SourceTitle,
            Authors = c.Authors,
            Year = c.Year,
            SourceType = c.SourceType,
            SectionName = c.SectionName,
            Excerpt = c.Excerpt,
            RelevanceScore = c.RelevanceScore,
        }).ToList() ?? new(),
    };
}
