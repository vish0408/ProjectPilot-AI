using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.DepartmentAnnouncement;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateAnnouncementRequestValidator : AbstractValidator<UpdateAnnouncementRequest>
{
    public UpdateAnnouncementRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Priority).Must(p => p is "Low" or "Normal" or "High" or "Critical")
            .When(x => !string.IsNullOrEmpty(x.Priority));
        RuleFor(x => x.Status).Must(s => s is "Draft" or "Published" or "Archived")
            .When(x => !string.IsNullOrEmpty(x.Status));
    }
}
