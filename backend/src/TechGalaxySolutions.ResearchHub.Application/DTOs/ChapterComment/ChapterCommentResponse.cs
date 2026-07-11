namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ChapterComment;

public class ChapterCommentResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int? LineNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}
