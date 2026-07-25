using FluentValidation;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Faculty;

namespace TechGalaxySolutions.ResearchHub.Application.Validators;

public class UpdateFacultyRequestValidator : AbstractValidator<UpdateFacultyRequest>
{
    public UpdateFacultyRequestValidator()
    {
        RuleFor(x => x.DepartmentId).NotEmpty();
        RuleFor(x => x.Designation).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Specialization).MaximumLength(200);
        RuleFor(x => x.JoiningDate).NotEmpty();
    }
}
