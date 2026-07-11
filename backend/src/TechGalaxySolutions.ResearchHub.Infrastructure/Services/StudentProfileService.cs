using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.StudentProfile;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class StudentProfileService : IStudentProfileService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public StudentProfileService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<StudentProfileResponse> GetProfileAsync(Guid userId)
    {
        var profile = await _context.StudentProfiles
            .Include(sp => sp.User)
            .Include(sp => sp.Guide)
            .FirstOrDefaultAsync(sp => sp.UserId == userId && !sp.IsDeleted);

        if (profile == null)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found");

            profile = new StudentProfile
            {
                UserId = userId,
                User = user,
                Enrollment = string.Empty,
                Department = string.Empty,
                Institution = string.Empty,
            };
            _context.StudentProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        return _mapper.Map<StudentProfileResponse>(profile);
    }

    public async Task<StudentProfileResponse> UpdateProfileAsync(Guid userId, UpdateStudentProfileRequest request)
    {
        var profile = await _context.StudentProfiles
            .Include(sp => sp.User)
            .Include(sp => sp.Guide)
            .FirstOrDefaultAsync(sp => sp.UserId == userId && !sp.IsDeleted);

        if (profile == null)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found");

            profile = new StudentProfile
            {
                UserId = userId,
                User = user,
            };
            _context.StudentProfiles.Add(profile);
        }

        profile.Enrollment = request.Enrollment;
        profile.Department = request.Department;
        profile.Institution = request.Institution;
        profile.ResearchTopic = request.ResearchTopic;
        profile.GuideId = request.GuideId;

        await _context.SaveChangesAsync();

        return _mapper.Map<StudentProfileResponse>(profile);
    }
}
