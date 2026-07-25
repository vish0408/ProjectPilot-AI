using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;

namespace TechGalaxySolutions.ResearchHub.Api.Controllers;

[ApiController]
[Route("hod/research-categories")]
[Authorize(Roles = "HOD,CollegeAdmin,SuperAdmin")]
public class ResearchCategoriesController : ControllerBase
{
    private readonly IResearchCategoryService _categoryService;

    public ResearchCategoriesController(IResearchCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateResearchCategoryRequest request)
    {
        var category = await _categoryService.CreateCategoryAsync(request);
        return Ok(category);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateResearchCategoryRequest request)
    {
        var category = await _categoryService.UpdateCategoryAsync(id, request);
        return Ok(category);
    }
}

