using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Notification;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class MarkReadRequestValidator : AbstractValidator<MarkReadRequest>
{
    public MarkReadRequestValidator()
    {
        RuleFor(x => x.NotificationIds).NotEmpty();
    }
}
