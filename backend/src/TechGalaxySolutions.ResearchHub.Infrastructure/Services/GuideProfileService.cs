using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.GuideProfile;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class GuideProfileService : IGuideProfileService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GuideProfileService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<GuideProfileResponse> GetProfileAsync(Guid userId)
    {
        var profile = await _context.Set<GuideProfile>().AsNoTracking()
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted);

        if (profile == null)
        {
            profile = new GuideProfile
            {
                UserId = userId,
                Department = string.Empty,
                Institution = string.Empty,
            };
            _context.Set<GuideProfile>().Add(profile);
            await _context.SaveChangesAsync();
            profile.User = (await _context.Users.FindAsync(userId))!;
        }

        return _mapper.Map<GuideProfileResponse>(profile);
    }

    public async Task<GuideProfileResponse> UpdateProfileAsync(Guid userId, UpdateGuideProfileRequest request)
    {
        var profile = await _context.Set<GuideProfile>()
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted)
            ?? throw new KeyNotFoundException("Guide profile not found");

        profile.Bio = request.Bio;
        profile.Department = request.Department;
        profile.Institution = request.Institution;
        profile.Specialization = request.Specialization;
        profile.Designation = request.Designation;
        profile.IsAvailable = request.IsAvailable;
        profile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<GuideProfileResponse>(profile);
    }
}
