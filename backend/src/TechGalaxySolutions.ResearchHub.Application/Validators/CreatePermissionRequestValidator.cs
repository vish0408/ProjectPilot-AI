using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Permission;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreatePermissionRequestValidator : AbstractValidator<CreatePermissionRequest>
{
    public CreatePermissionRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Group).NotEmpty().MaximumLength(100);
    }
}
