using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateResearchCategoryRequestValidator : AbstractValidator<CreateResearchCategoryRequest>
{
    public CreateResearchCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
