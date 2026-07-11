using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Meeting;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateMeetingRequestValidator : AbstractValidator<UpdateMeetingRequest>
{
    public UpdateMeetingRequestValidator()
    {
        RuleFor(x => x.Status)
            .Must(s => string.IsNullOrEmpty(s) || s is "Scheduled" or "InProgress" or "Completed" or "Cancelled")
            .WithMessage("Status must be Scheduled, InProgress, Completed, or Cancelled");
    }
}
