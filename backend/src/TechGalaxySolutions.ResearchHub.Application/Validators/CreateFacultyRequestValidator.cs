using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class CreateFacultyRequestValidator : AbstractValidator<CreateFacultyRequest>
{
    public CreateFacultyRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.DepartmentId).NotEmpty();
        RuleFor(x => x.Designation).NotEmpty().MaximumLength(100);
    }
}
