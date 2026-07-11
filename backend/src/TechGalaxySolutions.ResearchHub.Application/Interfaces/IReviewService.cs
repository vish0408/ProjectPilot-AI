using TechGalaxySolutions.ResearchHub.Application.DTOs.Review;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IReviewService
{
    Task<List<ReviewResponse>> GetProjectReviewsAsync(Guid projectId);
    Task<List<ReviewResponse>> GetMyReviewsAsync(Guid guideId);
    Task<ReviewResponse> CreateReviewAsync(Guid projectId, Guid guideId, CreateReviewRequest request);
}
