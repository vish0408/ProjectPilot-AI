using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.ResearchTopic;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateResearchTopicRequestValidator : AbstractValidator<CreateResearchTopicRequest>
{
    public CreateResearchTopicRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}
