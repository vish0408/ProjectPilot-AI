using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class ResearchCategoryService : IResearchCategoryService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ResearchCategoryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ResearchCategoryResponse>> GetCategoriesAsync()
    {
        var categories = await _context.Set<ResearchCategory>()
            .Include(c => c.ResearchTopics)
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return _mapper.Map<List<ResearchCategoryResponse>>(categories);
    }

    public async Task<ResearchCategoryResponse> CreateCategoryAsync(CreateResearchCategoryRequest request)
    {
        var category = new ResearchCategory
        {
            Name = request.Name,
            Description = request.Description,
        };

        _context.Set<ResearchCategory>().Add(category);
        await _context.SaveChangesAsync();

        return _mapper.Map<ResearchCategoryResponse>(category);
    }

    public async Task<ResearchCategoryResponse> UpdateCategoryAsync(Guid id, UpdateResearchCategoryRequest request)
    {
        var category = await _context.Set<ResearchCategory>()
            .Include(c => c.ResearchTopics)
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted)
            ?? throw new KeyNotFoundException("Category not found");

        category.Name = request.Name;
        category.Description = request.Description;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<ResearchCategoryResponse>(category);
    }
}
