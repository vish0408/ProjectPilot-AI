using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Review;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IReviewService
{
    Task<PagedResponse<ReviewResponse>> GetProjectReviewsAsync(Guid projectId, PagedRequest request);
    Task<PagedResponse<ReviewResponse>> GetMyReviewsAsync(Guid guideId, PagedRequest request);
    Task<ReviewResponse> CreateReviewAsync(Guid projectId, Guid guideId, CreateReviewRequest request);
}
