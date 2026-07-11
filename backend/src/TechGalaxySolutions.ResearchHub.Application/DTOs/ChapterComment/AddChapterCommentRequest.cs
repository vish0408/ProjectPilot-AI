namespace TechGalaxySolutions.ResearchHub.Application.DTOs.ChapterComment;

public class AddChapterCommentRequest
{
    public string Content { get; set; } = string.Empty;
    public int? LineNumber { get; set; }
}
