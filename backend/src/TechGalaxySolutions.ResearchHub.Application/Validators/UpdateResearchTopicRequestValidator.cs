using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateResearchTopicRequestValidator : AbstractValidator<UpdateResearchTopicRequest>
{
    public UpdateResearchTopicRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}
