using TechGalaxySolutions.ResearchHub.Application.DTOs.Chapter;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IChapterService
{
    Task<List<ChapterResponse>> GetProjectChaptersAsync(Guid projectId);
    Task<ChapterResponse> GetByIdAsync(Guid chapterId);
    Task<ChapterResponse> UpdateStatusAsync(Guid chapterId, Guid userId, UpdateChapterStatusRequest request);
}
