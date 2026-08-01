using AutoMapper;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
using TechGalaxySolutions.ResearchHub.Application.DTOs.HodManagement;
using TechGalaxySolutions.ResearchHub.Application.Exceptions;
using TechGalaxySolutions.ResearchHub.Application.Interfaces;
using TechGalaxySolutions.ResearchHub.Domain.Entities;
using TechGalaxySolutions.ResearchHub.Infrastructure.Persistence;

namespace TechGalaxySolutions.ResearchHub.Infrastructure.Services;

public class HodManagementService : IHodManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<HodManagementService> _logger;

    public HodManagementService(ApplicationDbContext context, IMapper mapper, IEmailService emailService, IAuditLogService auditLogService, ILogger<HodManagementService> logger)
    {
        _context = context;
        _mapper = mapper;
        _emailService = emailService;
        _auditLogService = auditLogService;
        _logger = logger;
    }

    public async Task<PagedResponse<HodResponse>> GetHodsAsync(PagedRequest request, Guid? collegeId = null, Guid? departmentId = null)
    {
        var query = _context.Set<Hod>().AsNoTracking()
            .Include(h => h.User)
            .Include(h => h.Department)
            .Include(h => h.College)
            .Where(h => !h.IsDeleted);

        if (collegeId.HasValue)
            query = query.Where(h => h.CollegeId == collegeId.Value);

        if (departmentId.HasValue)
            query = query.Where(h => h.DepartmentId == departmentId.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(h =>
                h.User.FullName.ToLower().Contains(term) ||
                h.User.Email.ToLower().Contains(term) ||
                h.User.EmployeeId!.ToLower().Contains(term) ||
                (h.User.PhoneNumber != null && h.User.PhoneNumber.ToLower().Contains(term)) ||
                h.Department.DepartmentName.ToLower().Contains(term) ||
                h.College.Name.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(request.StatusFilter))
        {
            if (bool.TryParse(request.StatusFilter, out var isActive))
                query = query.Where(h => h.IsActive == isActive);
        }

        query = (request.SortField?.ToLower()) switch
        {
            "fullname" => request.SortDirection == "desc" ? query.OrderByDescending(h => h.User.FullName) : query.OrderBy(h => h.User.FullName),
            "email" => request.SortDirection == "desc" ? query.OrderByDescending(h => h.User.Email) : query.OrderBy(h => h.User.Email),
            "employeeid" => request.SortDirection == "desc" ? query.OrderByDescending(h => h.User.EmployeeId) : query.OrderBy(h => h.User.EmployeeId),
            "departmentname" => request.SortDirection == "desc" ? query.OrderByDescending(h => h.Department.DepartmentName) : query.OrderBy(h => h.Department.DepartmentName),
            "collegename" => request.SortDirection == "desc" ? query.OrderByDescending(h => h.College.Name) : query.OrderBy(h => h.College.Name),
            "isactive" => request.SortDirection == "desc" ? query.OrderByDescending(h => h.IsActive) : query.OrderBy(h => h.IsActive),
            "createdat" => request.SortDirection == "desc" ? query.OrderByDescending(h => h.CreatedAt) : query.OrderBy(h => h.CreatedAt),
            _ => query.OrderBy(h => h.User.FullName)
        };

        var totalCount = await query.CountAsync();
        var hods = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var items = _mapper.Map<List<HodResponse>>(hods);
        return new PagedResponse<HodResponse>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<List<HodResponse>> GetAllHodsAsync(Guid? collegeId = null, Guid? departmentId = null)
    {
        var query = _context.Set<Hod>().AsNoTracking()
            .Include(h => h.User)
            .Include(h => h.Department)
            .Include(h => h.College)
            .Where(h => !h.IsDeleted);

        if (collegeId.HasValue)
            query = query.Where(h => h.CollegeId == collegeId.Value);

        if (departmentId.HasValue)
            query = query.Where(h => h.DepartmentId == departmentId.Value);

        var hods = await query.OrderBy(h => h.User.FullName).ToListAsync();
        return _mapper.Map<List<HodResponse>>(hods);
    }

    public async Task<HodResponse> GetHodAsync(Guid id)
    {
        var hod = await _context.Set<Hod>().AsNoTracking()
            .Include(h => h.User)
            .Include(h => h.Department)
            .Include(h => h.College)
            .FirstOrDefaultAsync(h => h.Id == id && !h.IsDeleted)
            ?? throw new KeyNotFoundException("HOD not found");

        return _mapper.Map<HodResponse>(hod);
    }

    public async Task<HodResponse> CreateHodAsync(CreateHodRequest request, Guid? collegeId = null)
    {
        var hodRole = await _context.Set<Role>().AsNoTracking()
            .FirstOrDefaultAsync(r => r.Name == "HOD" && !r.IsDeleted)
            ?? throw new InvalidOperationException("HOD role not found");

        var department = await _context.Set<Department>().AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == request.DepartmentId && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department not found");

        if (collegeId.HasValue && department.CollegeId != collegeId.Value)
            throw new ForbiddenException("You are not allowed to create HODs in another college");

        var emailExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Email == request.Email && !u.IsDeleted);
        if (emailExists)
            throw new ConflictException("Email is already in use");

        if (request.EmployeeId is { Length: > 0 })
        {
            var empExists = await _context.Set<User>().AsNoTracking()
                .AnyAsync(u => u.EmployeeId == request.EmployeeId && !u.IsDeleted);
            if (empExists)
                throw new ConflictException("Employee ID already exists");
        }

        var activeHodExists = await _context.Set<Hod>().AsNoTracking()
            .AnyAsync(h => h.DepartmentId == request.DepartmentId && h.IsActive && !h.IsDeleted);
        if (activeHodExists)
            throw new ConflictException("This department already has an active HOD");

        var password = request.Password ?? GenerateDefaultPassword();
        var employeeId = request.EmployeeId;
        if (string.IsNullOrWhiteSpace(employeeId))
            employeeId = await GenerateEmployeeIdAsync();

        var activationToken = Guid.NewGuid().ToString();
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.Phone,
            EmployeeId = employeeId,
            Designation = request.Designation,
            RoleId = hodRole.Id,
            CollegeId = department.CollegeId,
            DepartmentId = request.DepartmentId,
            TemporaryPasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            TemporaryPasswordExpiresAt = DateTime.UtcNow.AddHours(72),
            ActivationToken = activationToken,
            ActivationExpiry = DateTime.UtcNow.AddHours(24),
            Status = "Draft",
        };

        _context.Set<User>().Add(user);
        await _context.SaveChangesAsync();

        var hod = new Hod
        {
            UserId = user.Id,
            DepartmentId = request.DepartmentId,
            CollegeId = department.CollegeId,
            Qualification = request.Qualification,
            YearsOfExperience = request.YearsOfExperience,
            ProfilePhoto = request.ProfilePhoto,
            Status = request.Status,
            IsActive = false
        };

        _context.Set<Hod>().Add(hod);
        await _context.SaveChangesAsync();

        await _context.Entry(hod).Reference(h => h.User).LoadAsync();
        await _context.Entry(hod).Reference(h => h.Department).LoadAsync();
        await _context.Entry(hod).Reference(h => h.College).LoadAsync();

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
            _logger.LogError(ex, "Failed to send welcome email for HOD {Email}", user.Email);
            user.Status = "Draft";
            await _context.SaveChangesAsync();
        }

        await _auditLogService.LogAsync(user.Id, "User Created", "User", user.Id.ToString(), null, request.FullName);
        _logger.LogInformation("HOD created: {Email}, status: {Status}", user.Email, user.Status);

        return _mapper.Map<HodResponse>(hod);
    }

    public async Task<HodResponse> UpdateHodAsync(Guid id, UpdateHodRequest request, Guid? collegeId = null)
    {
        var hod = await _context.Set<Hod>()
            .Include(h => h.User)
            .Include(h => h.Department)
            .Include(h => h.College)
            .FirstOrDefaultAsync(h => h.Id == id && !h.IsDeleted)
            ?? throw new KeyNotFoundException("HOD not found");

        if (collegeId.HasValue && hod.CollegeId != collegeId.Value)
            throw new ForbiddenException("You are not allowed to manage HODs in another college");

        var emailExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Email == request.Email && u.Id != hod.UserId && !u.IsDeleted);
        if (emailExists)
            throw new ConflictException("Email is already in use by another user");

        if (request.EmployeeId is { Length: > 0 })
        {
            var empExists = await _context.Set<User>().AsNoTracking()
                .AnyAsync(u => u.EmployeeId == request.EmployeeId && u.Id != hod.UserId && !u.IsDeleted);
            if (empExists)
                throw new ConflictException("Employee ID already exists");
        }

        var department = await _context.Set<Department>().AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == request.DepartmentId && !d.IsDeleted)
            ?? throw new KeyNotFoundException("Department not found");

        if (collegeId.HasValue && department.CollegeId != collegeId.Value)
            throw new ForbiddenException("You are not allowed to move HODs to another college");

        if (request.DepartmentId != hod.DepartmentId)
        {
            var activeHodExists = await _context.Set<Hod>().AsNoTracking()
                .AnyAsync(h => h.DepartmentId == request.DepartmentId && h.IsActive && !h.IsDeleted && h.Id != id);
            if (activeHodExists)
                throw new ConflictException("The target department already has an active HOD");
        }

        hod.User.FullName = request.FullName;
        hod.User.Email = request.Email;
        hod.User.PhoneNumber = request.Phone;
        hod.User.EmployeeId = request.EmployeeId;
        hod.User.Designation = request.Designation;
        hod.User.CollegeId = department.CollegeId;
        hod.User.DepartmentId = request.DepartmentId;
        hod.User.UpdatedAt = DateTime.UtcNow;

        hod.DepartmentId = request.DepartmentId;
        hod.CollegeId = department.CollegeId;
        hod.Qualification = request.Qualification;
        hod.YearsOfExperience = request.YearsOfExperience;
        hod.ProfilePhoto = request.ProfilePhoto;
        hod.Status = request.Status;
        hod.IsActive = request.IsActive;
        hod.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<HodResponse>(hod);
    }

    public async Task DeleteHodAsync(Guid id)
    {
        var hod = await _context.Set<Hod>()
            .Include(h => h.User)
            .FirstOrDefaultAsync(h => h.Id == id && !h.IsDeleted)
            ?? throw new KeyNotFoundException("HOD not found");

        hod.IsDeleted = true;
        hod.UpdatedAt = DateTime.UtcNow;
        hod.User.IsDeleted = true;
        hod.User.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private async Task<string> GenerateEmployeeIdAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"HOD{year}";
        var lastEmp = await _context.Set<User>().AsNoTracking()
            .Where(u => u.EmployeeId != null && u.EmployeeId.StartsWith(prefix) && !u.IsDeleted)
            .OrderByDescending(u => u.EmployeeId)
            .Select(u => u.EmployeeId)
            .FirstOrDefaultAsync();

        if (lastEmp == null)
            return $"{prefix}00001";

        var numPart = lastEmp[prefix.Length..];
        if (int.TryParse(numPart, out var num))
            return $"{prefix}{(num + 1).ToString("D5")}";

        return $"{prefix}00001";
    }

    private static string GenerateDefaultPassword()
    {
        return $"Hod@{Guid.NewGuid().ToString("N")[..8]}";
    }
}
