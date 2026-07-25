using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProfile;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodProfileService : IHodProfileService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HodProfileService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<HodProfileResponse> GetProfileAsync(Guid userId)
    {
        var profile = await _context.Set<DepartmentProfile>()
            .Include(d => d.HodUser)
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted);

        if (profile == null)
        {
            var deletedProfile = await _context.Set<DepartmentProfile>()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(d => d.HodUserId == userId && d.IsDeleted);

            if (deletedProfile != null)
            {
                deletedProfile.IsDeleted = false;
                profile = deletedProfile;
            }
            else
            {
                var user = await _context.Users.FindAsync(userId)
                    ?? throw new KeyNotFoundException("User not found");

                var deptName = $"{user.FullName}'s Department";
                var existingNames = await _context.Set<DepartmentProfile>()
                    .IgnoreQueryFilters()
                    .Where(d => d.DepartmentName!.StartsWith(deptName))
                    .Select(d => d.DepartmentName)
                    .ToListAsync();
                if (existingNames.Count > 0)
                    deptName = $"{user.FullName}'s Department ({userId.ToString("N")[..8]})";

                profile = new DepartmentProfile
                {
                    DepartmentName = deptName,
                    Institution = "",
                    HodUserId = userId,
                };
                _context.Set<DepartmentProfile>().Add(profile);

                var settings = new DepartmentSettings
                {
                    DepartmentProfileId = profile.Id,
                };
                _context.Set<DepartmentSettings>().Add(settings);
            }

            await _context.SaveChangesAsync();

            if (profile.HodUser == null)
                profile.HodUser = await _context.Users.FindAsync(userId);
        }

        return _mapper.Map<HodProfileResponse>(profile);
    }

    public async Task<HodProfileResponse> UpdateProfileAsync(Guid userId, UpdateHodProfileRequest request)
    {
        var profile = await _context.Set<DepartmentProfile>()
            .Include(d => d.HodUser)
            .FirstOrDefaultAsync(d => d.HodUserId == userId && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department profile not found");

        profile.Description = request.Description;
        profile.ContactEmail = request.ContactEmail;
        profile.Location = request.Location;
        profile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<HodProfileResponse>(profile);
    }
}
