using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.RoleId).NotEmpty();
        RuleFor(x => x.Password).MinimumLength(6).When(x => !string.IsNullOrWhiteSpace(x.Password));
        RuleFor(x => x.PhoneNumber).MaximumLength(20).When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));
        RuleFor(x => x.EmployeeId).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.EmployeeId));
        RuleFor(x => x.Enrollment).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Enrollment));
        RuleFor(x => x.Section).MaximumLength(20).When(x => !string.IsNullOrWhiteSpace(x.Section));
        RuleFor(x => x.ResearchTopic).MaximumLength(500).When(x => !string.IsNullOrWhiteSpace(x.ResearchTopic));
        RuleFor(x => x.Specialization).MaximumLength(300).When(x => !string.IsNullOrWhiteSpace(x.Specialization));
        RuleFor(x => x.Bio).MaximumLength(2000).When(x => !string.IsNullOrWhiteSpace(x.Bio));
        RuleFor(x => x.Qualification).MaximumLength(300).When(x => !string.IsNullOrWhiteSpace(x.Qualification));
        RuleFor(x => x.YearsOfExperience).GreaterThanOrEqualTo(0).When(x => x.YearsOfExperience.HasValue);
    }
}
