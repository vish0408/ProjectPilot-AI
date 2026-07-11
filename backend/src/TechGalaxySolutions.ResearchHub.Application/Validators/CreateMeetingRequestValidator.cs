using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Meeting;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateMeetingRequestValidator : AbstractValidator<CreateMeetingRequest>
{
    public CreateMeetingRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.ScheduledAt)
            .GreaterThan(DateTime.UtcNow).WithMessage("Meeting must be scheduled in the future");

        RuleFor(x => x.DurationMinutes)
            .InclusiveBetween(15, 480).WithMessage("Duration must be between 15 minutes and 8 hours");

        RuleFor(x => x.Agenda)
            .MaximumLength(5000).WithMessage("Agenda must not exceed 5000 characters");
    }
}
