using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateAnnouncementRequestValidator : AbstractValidator<CreateAnnouncementRequest>
{
    public CreateAnnouncementRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty().MaximumLength(5000);
    }
}
