using AutoMapper;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.DTOs.UserManagement;
using TechGalaxySolutions.ResearchHub.Application.Exceptions;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class UserManagementService : IUserManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IAuditLogService _auditLogService;
    private readonly IEmailService _emailService;
    private readonly ILogger<UserManagementService> _logger;

    public UserManagementService(
        ApplicationDbContext context,
        IMapper mapper,
        IAuditLogService auditLogService,
        IEmailService emailService,
        ILogger<UserManagementService> logger)
    {
        _context = context;
        _mapper = mapper;
        _auditLogService = auditLogService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<List<UserResponse>> GetUsersAsync()
    {
        var users = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.FullName)
            .ToListAsync();

        return _mapper.Map<List<UserResponse>>(users);
    }

    public async Task<UserResponse> GetUserAsync(Guid id)
    {
        var user = await _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted)
            ?? throw new KeyNotFoundException("User not found");

        return _mapper.Map<UserResponse>(user);
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
    {
        var emailExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Email == request.Email && !u.IsDeleted);

        if (emailExists)
            throw new ConflictException("Email is already in use");

        var role = await _context.Set<Role>().AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.RoleId && !r.IsDeleted);

        if (role == null)
            throw new InvalidOperationException("Role is invalid");

        if (request.EmployeeId is { Length: > 0 })
        {
            var empExists = await _context.Set<User>().AsNoTracking()
                .AnyAsync(u => u.EmployeeId == request.EmployeeId && !u.IsDeleted);

            if (empExists)
                throw new ConflictException("Employee ID already exists");
        }

        if (request.PhoneNumber is { Length: > 0 })
        {
            var phoneExists = await _context.Set<User>().AsNoTracking()
                .AnyAsync(u => u.PhoneNumber == request.PhoneNumber && !u.IsDeleted);

            if (phoneExists)
                throw new ConflictException("Phone number already exists");
        }

        var roleName = role.Name.ToLowerInvariant();
        var isSuperAdmin = roleName == "superadmin";
        var isAdmin = roleName == "collegeadmin";
        var isHod = roleName == "hod";
        var isGuide = roleName == "guide";
        var isStudent = roleName == "student";
        var needsCollegeDept = isStudent || isGuide || isHod;

        if (!isSuperAdmin && !request.CollegeId.HasValue)
            throw new InvalidOperationException("College is required for this role");

        if (needsCollegeDept && !request.DepartmentId.HasValue)
            throw new InvalidOperationException("Department is required for this role");

        if (request.CollegeId.HasValue)
        {
            var collegeExists = await _context.Set<College>().AsNoTracking()
                .AnyAsync(c => c.Id == request.CollegeId.Value && !c.IsDeleted);

            if (!collegeExists)
                throw new KeyNotFoundException("Selected college not found");
        }

        if (request.DepartmentId.HasValue)
        {
            var departmentExists = await _context.Set<Department>().AsNoTracking()
                .AnyAsync(d => d.Id == request.DepartmentId.Value && !d.IsDeleted);

            if (!departmentExists)
                throw new KeyNotFoundException("Selected department not found");

            if (request.CollegeId.HasValue)
            {
                var departmentBelongs = await _context.Set<Department>().AsNoTracking()
                    .AnyAsync(d => d.Id == request.DepartmentId.Value && d.CollegeId == request.CollegeId.Value && !d.IsDeleted);

                if (!departmentBelongs)
                    throw new InvalidOperationException("Department does not belong to the selected college");
            }
        }

        var password = GenerateRandomPassword();
        var activationToken = Guid.NewGuid().ToString();
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            RoleId = request.RoleId,
            CollegeId = request.CollegeId,
            DepartmentId = request.DepartmentId,
            IsFirstLogin = request.Password == null,
            TemporaryPasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            TemporaryPasswordExpiresAt = DateTime.UtcNow.AddHours(72),
            ActivationToken = activationToken,
            ActivationExpiry = DateTime.UtcNow.AddHours(24),
            Status = "Draft",
        };

        _context.Set<User>().Add(user);
        await _context.SaveChangesAsync();

        var userRoleName = role.Name.ToLowerInvariant();
        if (userRoleName == "student")
        {
            _context.Set<StudentProfile>().Add(new StudentProfile
            {
                UserId = user.Id,
                Department = "",
                Institution = ""
            });
            await _context.SaveChangesAsync();
        }
        else if (userRoleName == "guide")
        {
            _context.Set<GuideProfile>().Add(new GuideProfile
            {
                UserId = user.Id,
                Department = "",
                Institution = ""
            });
            await _context.SaveChangesAsync();
        }
        else if (userRoleName == "hod" && user.CollegeId.HasValue && user.DepartmentId.HasValue)
        {
            _context.Set<Hod>().Add(new Hod
            {
                UserId = user.Id,
                DepartmentId = user.DepartmentId.Value,
                CollegeId = user.CollegeId.Value
            });
            await _context.SaveChangesAsync();
        }

        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        try
        {
            _logger.LogInformation("Sending welcome email to {Recipient}...", user.Email);
            await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName, password, activationToken);
            user.Status = "InvitationSent";
            user.InvitationSentAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email for user {Email}", user.Email);
            user.Status = "Draft";
            await _context.SaveChangesAsync();
        }

        await _auditLogService.LogAsync(user.Id, "User Created", "User", user.Id.ToString(), null, request.FullName);
        _logger.LogInformation("User created: {Email}, status: {Status}", user.Email, user.Status);

        return _mapper.Map<UserResponse>(user);
    }

    public async Task<UserResponse> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _context.Set<User>()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted)
            ?? throw new KeyNotFoundException("User not found");

        var emailExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Email == request.Email && u.Id != id && !u.IsDeleted);

        if (emailExists)
            throw new ConflictException("Email is already in use by another user");

        var roleExists = await _context.Set<Role>().AsNoTracking()
            .AnyAsync(r => r.Id == request.RoleId && !r.IsDeleted);

        if (!roleExists)
            throw new InvalidOperationException("Role is invalid");

        if (request.EmployeeId is { Length: > 0 })
        {
            var empExists = await _context.Set<User>().AsNoTracking()
                .AnyAsync(u => u.EmployeeId == request.EmployeeId && u.Id != id && !u.IsDeleted);

            if (empExists)
                throw new ConflictException("Employee ID already exists");
        }

        if (request.PhoneNumber is { Length: > 0 })
        {
            var phoneExists = await _context.Set<User>().AsNoTracking()
                .AnyAsync(u => u.PhoneNumber == request.PhoneNumber && u.Id != id && !u.IsDeleted);

            if (phoneExists)
                throw new ConflictException("Phone number already exists");
        }

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.IsActive = request.IsActive;
        user.RoleId = request.RoleId;
        user.CollegeId = request.CollegeId;
        user.DepartmentId = request.DepartmentId;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(user.Id, "User Updated", "User", user.Id.ToString(), null, request.FullName);

        return _mapper.Map<UserResponse>(user);
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted)
            ?? throw new KeyNotFoundException("User not found");

        user.IsDeleted = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(user.Id, "User Deleted", "User", user.Id.ToString(), user.FullName, null);
    }

    private static string GenerateRandomPassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
        var random = Random.Shared;
        var password = new char[12];
        for (int i = 0; i < 12; i++)
            password[i] = chars[random.Next(chars.Length)];
        return new string(password);
    }
}
