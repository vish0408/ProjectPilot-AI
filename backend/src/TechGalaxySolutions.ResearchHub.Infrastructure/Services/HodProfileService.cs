using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodProfile;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;
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
        var hod = await _context.Set<Hod>().AsNoTracking()
            .Include(h => h.User)
            .Include(h => h.Department)
            .Include(h => h.College)
            .FirstOrDefaultAsync(h => h.UserId == userId && !h.IsDeleted);

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
                var profileUser = await _context.Users.FindAsync(userId)
                    ?? throw new KeyNotFoundException("User not found");

                var deptName = hod?.Department?.DepartmentName
                    ?? $"{profileUser.FullName}'s Department";
                var existingNames = await _context.Set<DepartmentProfile>()
                    .IgnoreQueryFilters()
                    .Where(d => d.DepartmentName!.StartsWith(deptName))
                    .Select(d => d.DepartmentName)
                    .ToListAsync();
                if (existingNames.Count > 0)
                    deptName = $"{deptName} ({userId.ToString("N")[..8]})";

                profile = new DepartmentProfile
                {
                    DepartmentName = deptName,
                    Institution = hod?.College?.Name ?? "",
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

        var response = _mapper.Map<HodProfileResponse>(profile);

        // Fill in real identity + scope data from the Hod/User entities so the
        // profile reflects the actual department/college, not a placeholder.
        var user = await _context.Users.AsNoTracking()
            .Include(u => u.DepartmentEntity)
            .Include(u => u.CollegeEntity)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user != null)
        {
            response.EmployeeId = user.EmployeeId;
            response.PhoneNumber = user.PhoneNumber;
            response.Designation = user.Designation;
            response.DepartmentId = user.DepartmentId;
            response.CollegeId = user.CollegeId;
            response.DepartmentName = user.DepartmentEntity?.DepartmentName ?? user.Department ?? response.DepartmentName;
            response.CollegeName = user.CollegeEntity?.Name ?? user.College ?? "";
            response.AccountStatus = UserResponse.ComputeAccountStatus(
                user.Status, user.IsActive,
                user.LockedUntil.HasValue && user.LockedUntil.Value > DateTime.UtcNow,
                user.IsFirstLogin, user.TemporaryPasswordExpiresAt);
        }
        else if (hod != null)
        {
            response.DepartmentName = hod.Department?.DepartmentName ?? "";
            response.CollegeName = hod.College?.Name ?? "";
            response.DepartmentId = hod.DepartmentId;
            response.CollegeId = hod.CollegeId;
        }

        return response;
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

        return await GetProfileAsync(userId);
    }
}
