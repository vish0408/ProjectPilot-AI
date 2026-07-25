using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateNotificationRequestValidator : AbstractValidator<CreateNotificationRequest>
{
    public CreateNotificationRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Type).NotEmpty().MaximumLength(50);
    }
}
