using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GlobalAnnouncement;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateGlobalAnnouncementRequestValidator : AbstractValidator<CreateGlobalAnnouncementRequest>
{
    public CreateGlobalAnnouncementRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty().MaximumLength(5000);
    }
}
