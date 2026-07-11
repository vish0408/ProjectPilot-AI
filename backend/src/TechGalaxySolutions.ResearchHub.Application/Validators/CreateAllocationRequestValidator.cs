using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ProjectAllocation;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateAllocationRequestValidator : AbstractValidator<CreateAllocationRequest>
{
    public CreateAllocationRequestValidator()
    {
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.GuideId).NotEmpty();
    }
}
