using TechGalaxySolutions.ResearchHub.Application.DTOs.ChapterComment;

namespace TechGalaxySolutions.ResearchHub.Application.DTOs.Chapter;

public class ChapterResponse
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Order { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<ChapterCommentResponse> Comments { get; set; } = new();
}
