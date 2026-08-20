using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;

namespace TechGalaxySolutions.ResearchHub.Application.Interfaces;

public interface IResearchCategoryService
{
    Task<List<ResearchCategoryResponse>> GetCategoriesAsync();
    Task<ResearchCategoryResponse> CreateCategoryAsync(CreateResearchCategoryRequest request);
    Task<ResearchCategoryResponse> UpdateCategoryAsync(Guid id, UpdateResearchCategoryRequest request);
    Task EnsureProvisionedAsync();
}
