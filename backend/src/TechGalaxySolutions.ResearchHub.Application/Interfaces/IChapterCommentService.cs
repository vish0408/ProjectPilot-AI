using TechGalaxySolutions.ResearchHub.Application.DTOs.ChapterComment;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IChapterCommentService
{
    Task<List<ChapterCommentResponse>> GetChapterCommentsAsync(Guid chapterId);
    Task<ChapterCommentResponse> AddCommentAsync(Guid chapterId, Guid userId, AddChapterCommentRequest request);
    Task DeleteCommentAsync(Guid commentId, Guid userId);
}
