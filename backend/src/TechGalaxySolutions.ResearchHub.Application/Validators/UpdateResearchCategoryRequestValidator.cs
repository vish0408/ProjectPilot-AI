using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchCategory;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateResearchCategoryRequestValidator : AbstractValidator<UpdateResearchCategoryRequest>
{
    public UpdateResearchCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
