using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodGuide;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class AssignGuideRequestValidator : AbstractValidator<AssignGuideRequest>
{
    public AssignGuideRequestValidator()
    {
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.GuideId).NotEmpty();
        RuleFor(x => x.Remarks).MaximumLength(500);
    }
}
