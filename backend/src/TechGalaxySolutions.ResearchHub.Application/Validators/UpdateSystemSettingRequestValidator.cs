using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.SystemSetting;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateSystemSettingRequestValidator : AbstractValidator<UpdateSystemSettingRequest>
{
    public UpdateSystemSettingRequestValidator()
    {
        RuleFor(x => x.Value).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
