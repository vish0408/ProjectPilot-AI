using AutoMapper;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TechGalaxySolutions.ResearchHub.Application.DTOs.Common;
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

    public async Task<List<UserResponse>> GetAllUsersAsync(Guid? collegeId = null)
    {
        var query = _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Include(u => u.DepartmentEntity)
            .Include(u => u.CollegeEntity)
            .Where(u => !u.IsDeleted);

        if (collegeId.HasValue)
            query = query.Where(u => u.CollegeId == collegeId.Value);

        var users = await query
            .OrderBy(u => u.FullName)
            .ToListAsync();

        var items = _mapper.Map<List<UserResponse>>(users);
        await PopulateRoleDetailsAsync(items);
        return items;
    }

    public async Task<PagedResponse<UserResponse>> GetUsersAsync(PagedRequest request, Guid? collegeId = null)
    {
        var query = _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Include(u => u.DepartmentEntity)
            .Include(u => u.CollegeEntity)
            .Where(u => !u.IsDeleted);

        if (collegeId.HasValue)
            query = query.Where(u => u.CollegeId == collegeId.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();

            var enrollmentUserIds = await _context.Set<StudentProfile>().AsNoTracking()
                .Where(sp => !sp.IsDeleted && sp.Enrollment != null && sp.Enrollment.ToLower().Contains(term))
                .Select(sp => sp.UserId)
                .ToListAsync();

            var academicYearIds = await _context.Set<AcademicYear>().AsNoTracking()
                .Where(a => !a.IsDeleted && a.Name.ToLower().Contains(term))
                .Select(a => a.Id)
                .ToListAsync();

            var semesterIds = await _context.Set<Semester>().AsNoTracking()
                .Where(s => !s.IsDeleted && s.Name.ToLower().Contains(term))
                .Select(s => s.Id)
                .ToListAsync();

            var academicMatchedUserIds = await _context.Set<StudentProfile>().AsNoTracking()
                .Where(sp => !sp.IsDeleted &&
                    ((sp.AcademicYearId.HasValue && academicYearIds.Contains(sp.AcademicYearId.Value)) ||
                     (sp.SemesterId.HasValue && semesterIds.Contains(sp.SemesterId.Value))))
                .Select(sp => sp.UserId)
                .ToListAsync();

            var allMatchedUserIds = enrollmentUserIds.Concat(academicMatchedUserIds).Distinct().ToList();

            query = query.Where(u =>
                (u.EmployeeId != null && u.EmployeeId.ToLower().Contains(term)) ||
                u.FullName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term) ||
                (u.PhoneNumber != null && u.PhoneNumber.ToLower().Contains(term)) ||
                u.Role.Name.ToLower().Contains(term) ||
                (u.DepartmentEntity != null && u.DepartmentEntity.DepartmentName.ToLower().Contains(term)) ||
                (u.CollegeEntity != null && u.CollegeEntity.Name.ToLower().Contains(term)) ||
                u.Status.ToLower().Contains(term) ||
                allMatchedUserIds.Contains(u.Id));
        }

        if (!string.IsNullOrWhiteSpace(request.RoleFilter))
        {
            var roleTerm = request.RoleFilter.ToLower();
            query = query.Where(u => u.Role.Name.ToLower() == roleTerm);
        }

        if (!string.IsNullOrWhiteSpace(request.StatusFilter))
        {
            var statusTerm = request.StatusFilter.ToLower();
            if (statusTerm == "inactive")
                query = query.Where(u => !u.IsActive);
            else if (statusTerm == "pending")
                query = query.Where(u => u.Status.ToLower() == "draft" || u.Status.ToLower() == "invitationsent");
            else
                query = query.Where(u => u.Status.ToLower() == statusTerm);
        }

        if (!string.IsNullOrWhiteSpace(request.DepartmentFilter) && Guid.TryParse(request.DepartmentFilter, out var deptId))
        {
            query = query.Where(u => u.DepartmentId == deptId);
        }

        if (!string.IsNullOrWhiteSpace(request.CollegeFilter) && Guid.TryParse(request.CollegeFilter, out var reqCollegeId))
        {
            query = query.Where(u => u.CollegeId == reqCollegeId);
        }

        if (!string.IsNullOrWhiteSpace(request.GuideFilter) && Guid.TryParse(request.GuideFilter, out var guideId))
        {
            var studentUserIds = await _context.Set<StudentProfile>().AsNoTracking()
                .Where(sp => sp.GuideId == guideId && !sp.IsDeleted)
                .Select(sp => sp.UserId)
                .ToListAsync();
            query = query.Where(u => studentUserIds.Contains(u.Id));
        }

        if (!string.IsNullOrWhiteSpace(request.AcademicYearFilter) && Guid.TryParse(request.AcademicYearFilter, out var academicYearId))
        {
            var studentUserIds = await _context.Set<StudentProfile>().AsNoTracking()
                .Where(sp => sp.AcademicYearId == academicYearId && !sp.IsDeleted)
                .Select(sp => sp.UserId)
                .ToListAsync();
            query = query.Where(u => studentUserIds.Contains(u.Id));
        }

        if (!string.IsNullOrWhiteSpace(request.SemesterFilter) && Guid.TryParse(request.SemesterFilter, out var semesterId))
        {
            var studentUserIds = await _context.Set<StudentProfile>().AsNoTracking()
                .Where(sp => sp.SemesterId == semesterId && !sp.IsDeleted)
                .Select(sp => sp.UserId)
                .ToListAsync();
            query = query.Where(u => studentUserIds.Contains(u.Id));
        }

        query = (request.SortField?.ToLower()) switch
        {
            "fullname" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName),
            "email" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "employeeid" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.EmployeeId) : query.OrderBy(u => u.EmployeeId),
            "enrollment" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.EmployeeId) : query.OrderBy(u => u.EmployeeId),
            "rolename" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.Role.Name) : query.OrderBy(u => u.Role.Name),
            "department" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.DepartmentEntity!.DepartmentName) : query.OrderBy(u => u.DepartmentEntity!.DepartmentName),
            "college" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.CollegeEntity!.Name) : query.OrderBy(u => u.CollegeEntity!.Name),
            "status" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.Status) : query.OrderBy(u => u.Status),
            "createdat" => request.SortDirection == "desc" ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            _ => query.OrderBy(u => u.FullName)
        };

        var totalCount = await query.CountAsync();
        var users = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var items = _mapper.Map<List<UserResponse>>(users);
        await PopulateRoleDetailsAsync(items);
        return new PagedResponse<UserResponse>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<UserResponse> GetUserAsync(Guid id, Guid? collegeId = null)
    {
        var query = _context.Set<User>().AsNoTracking()
            .Include(u => u.Role)
            .Include(u => u.DepartmentEntity)
            .Include(u => u.CollegeEntity)
            .Where(u => u.Id == id && !u.IsDeleted);

        if (collegeId.HasValue)
            query = query.Where(u => u.CollegeId == collegeId.Value);

        var user = await query.FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("User not found");

        var response = _mapper.Map<UserResponse>(user);
        await PopulateRoleDetailsAsync(new List<UserResponse> { response });
        return response;
    }

    private async Task PopulateRoleDetailsAsync(List<UserResponse> users)
    {
        if (users.Count == 0)
            return;

        var userIds = users.Select(u => u.Id).ToList();

        var studentProfiles = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(sp => userIds.Contains(sp.UserId))
            .ToDictionaryAsync(sp => sp.UserId);

        var guideProfiles = await _context.Set<GuideProfile>().AsNoTracking()
            .Where(gp => userIds.Contains(gp.UserId))
            .ToDictionaryAsync(gp => gp.UserId);

        var hods = await _context.Set<Hod>().AsNoTracking()
            .Where(h => userIds.Contains(h.UserId))
            .ToDictionaryAsync(h => h.UserId);

        var guideUserIds = studentProfiles.Values
            .Where(sp => sp.GuideId.HasValue)
            .Select(sp => sp.GuideId!.Value)
            .Distinct()
            .ToList();

        var guideNames = new Dictionary<Guid, string>();
        if (guideUserIds.Count > 0)
        {
            guideNames = await _context.Set<User>().AsNoTracking()
                .Where(u => guideUserIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.FullName);
        }

        var academicYears = new Dictionary<Guid, string>();
        var semesterNames = new Dictionary<Guid, string>();
        var studentSemesterIds = studentProfiles.Values
            .Where(sp => sp.SemesterId.HasValue)
            .Select(sp => sp.SemesterId!.Value)
            .Distinct()
            .ToList();
        if (studentSemesterIds.Count > 0)
        {
            semesterNames = await _context.Set<Semester>().AsNoTracking()
                .Where(s => studentSemesterIds.Contains(s.Id))
                .ToDictionaryAsync(s => s.Id, s => s.Name);
        }
        var studentAcademicYearIds = studentProfiles.Values
            .Where(sp => sp.AcademicYearId.HasValue)
            .Select(sp => sp.AcademicYearId!.Value)
            .Distinct()
            .ToList();
        if (studentAcademicYearIds.Count > 0)
        {
            academicYears = await _context.Set<AcademicYear>().AsNoTracking()
                .Where(a => studentAcademicYearIds.Contains(a.Id))
                .ToDictionaryAsync(a => a.Id, a => a.Name);
        }

        var guideCounts = await _context.Set<StudentProfile>().AsNoTracking()
            .Where(s => s.GuideId.HasValue && userIds.Contains(s.GuideId.Value) && !s.IsDeleted)
            .GroupBy(s => s.GuideId!.Value)
            .Select(g => new { GuideId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.GuideId, g => g.Count);

        var studentUserIds = studentProfiles.Keys.ToList();
        var researchStatus = new Dictionary<Guid, string>();
        if (studentUserIds.Count > 0)
        {
            var projects = await _context.Set<Project>().AsNoTracking()
                .Where(p => studentUserIds.Contains(p.StudentId) && !p.IsDeleted)
                .OrderBy(p => p.StudentId)
                .ThenByDescending(p => p.UpdatedAt)
                .Select(p => new { p.StudentId, p.Status })
                .ToListAsync();

            researchStatus = projects
                .GroupBy(p => p.StudentId)
                .ToDictionary(g => g.Key, g => g.First().Status switch
                {
                    TechGalaxySolutions.ResearchHub.Domain.Entities.Enums.ProjectStatus.NotStarted => "Not Started",
                    TechGalaxySolutions.ResearchHub.Domain.Entities.Enums.ProjectStatus.InProgress => "In Progress",
                    TechGalaxySolutions.ResearchHub.Domain.Entities.Enums.ProjectStatus.Completed => "Completed",
                    TechGalaxySolutions.ResearchHub.Domain.Entities.Enums.ProjectStatus.OnHold => "On Hold",
                    _ => "Not Started"
                });
        }

        foreach (var user in users)
        {
            if (studentProfiles.TryGetValue(user.Id, out var student))
            {
                user.Enrollment = string.IsNullOrEmpty(student.Enrollment) ? user.EmployeeId : student.Enrollment;
                user.EmployeeId = string.IsNullOrEmpty(user.EmployeeId) ? student.Enrollment : user.EmployeeId;
                user.ResearchTopic = student.ResearchTopic;
                user.GuideId = student.GuideId;
                user.Section = student.Section;
                user.AcademicYearId = student.AcademicYearId;
                user.SemesterId = student.SemesterId;
                if (student.GuideId.HasValue && guideNames.TryGetValue(student.GuideId.Value, out var guideName))
                    user.GuideName = guideName;
                if (user.SemesterId.HasValue && semesterNames.TryGetValue(user.SemesterId.Value, out var semesterName))
                    user.SemesterName = semesterName;
                if (user.AcademicYearId.HasValue && academicYears.TryGetValue(user.AcademicYearId.Value, out var academicYearName))
                    user.AcademicYearName = academicYearName;
                user.Designation ??= "Student";
                user.ResearchStatus = researchStatus.TryGetValue(user.Id, out var status) ? status : "No Project";
            }

            if (guideProfiles.TryGetValue(user.Id, out var guide))
            {
                user.Specialization = guide.Specialization;
                user.Bio = guide.Bio;
                user.Designation ??= guide.Designation;
                user.AssignedStudents = guideCounts.TryGetValue(user.Id, out var count) ? count : 0;
            }

            if (hods.TryGetValue(user.Id, out var hod))
            {
                user.Qualification = hod.Qualification;
                user.YearsOfExperience = hod.YearsOfExperience;
            }
        }
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request, Guid? collegeId = null)
    {
        var effectiveCollegeId = collegeId ?? request.CollegeId;

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

        if (!isSuperAdmin && !effectiveCollegeId.HasValue)
            throw new InvalidOperationException("College is required for this role");

        if (needsCollegeDept && !request.DepartmentId.HasValue)
            throw new InvalidOperationException("Department is required for this role");

        if (isStudent)
        {
            var studentId = !string.IsNullOrWhiteSpace(request.EmployeeId) ? request.EmployeeId : request.Enrollment;
            if (string.IsNullOrWhiteSpace(studentId))
                throw new InvalidOperationException("Student ID is required for the Student role");
            if (!request.GuideId.HasValue)
                throw new InvalidOperationException("Assigned guide is required for the Student role");
            if (!request.AcademicYearId.HasValue)
                throw new InvalidOperationException("Academic Year is required for the Student role");
            if (!request.SemesterId.HasValue)
                throw new InvalidOperationException("Semester is required for the Student role");
        }

        if (isStudent && request.AcademicYearId.HasValue)
        {
            var academicYearExists = await _context.Set<AcademicYear>().AsNoTracking()
                .AnyAsync(a => a.Id == request.AcademicYearId.Value && !a.IsDeleted);
            if (!academicYearExists)
                throw new KeyNotFoundException("Selected academic year not found");
        }

        if (isStudent && request.SemesterId.HasValue)
        {
            var semesterExists = await _context.Set<Semester>().AsNoTracking()
                .AnyAsync(s => s.Id == request.SemesterId.Value && !s.IsDeleted);
            if (!semesterExists)
                throw new KeyNotFoundException("Selected semester not found");
        }

        if (effectiveCollegeId.HasValue)
        {
            var collegeExists = await _context.Set<College>().AsNoTracking()
                .AnyAsync(c => c.Id == effectiveCollegeId.Value && !c.IsDeleted);

            if (!collegeExists)
                throw new KeyNotFoundException("Selected college not found");
        }

        if (request.DepartmentId.HasValue)
        {
            var departmentExists = await _context.Set<Department>().AsNoTracking()
                .AnyAsync(d => d.Id == request.DepartmentId.Value && !d.IsDeleted);

            if (!departmentExists)
                throw new KeyNotFoundException("Selected department not found");

            if (effectiveCollegeId.HasValue)
            {
                var departmentBelongs = await _context.Set<Department>().AsNoTracking()
                    .AnyAsync(d => d.Id == request.DepartmentId.Value && d.CollegeId == effectiveCollegeId.Value && !d.IsDeleted);

                if (!departmentBelongs)
                    throw new InvalidOperationException("Department does not belong to the selected college");
            }
        }

        var password = GenerateRandomPassword();
        var activationToken = Guid.NewGuid().ToString();

        var isStudentRole = role.Name.ToLowerInvariant() == "student";
        var effectiveEmployeeId = isStudentRole
            ? (!string.IsNullOrWhiteSpace(request.EmployeeId) ? request.EmployeeId : request.Enrollment)
            : request.EmployeeId;

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            RoleId = request.RoleId,
            CollegeId = effectiveCollegeId,
            DepartmentId = request.DepartmentId,
            EmployeeId = effectiveEmployeeId,
            PhoneNumber = request.PhoneNumber,
            Designation = request.Designation,
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
                Enrollment = !string.IsNullOrWhiteSpace(request.Enrollment) ? request.Enrollment : (request.EmployeeId ?? ""),
                Department = request.DepartmentId.HasValue ? await GetDepartmentNameAsync(request.DepartmentId.Value) : "",
                Institution = effectiveCollegeId.HasValue ? await GetCollegeNameAsync(effectiveCollegeId.Value) : "",
                ResearchTopic = request.ResearchTopic,
                GuideId = request.GuideId,
                AcademicYearId = request.AcademicYearId,
                SemesterId = request.SemesterId,
                Section = request.Section
            });
            await _context.SaveChangesAsync();
        }
        else if (userRoleName == "guide")
        {
            _context.Set<GuideProfile>().Add(new GuideProfile
            {
                UserId = user.Id,
                Department = request.DepartmentId.HasValue ? await GetDepartmentNameAsync(request.DepartmentId.Value) : "",
                Institution = effectiveCollegeId.HasValue ? await GetCollegeNameAsync(effectiveCollegeId.Value) : "",
                Specialization = request.Specialization ?? "",
                Bio = request.Bio ?? "",
                Designation = request.Designation ?? ""
            });
            await _context.SaveChangesAsync();
        }
        else if (userRoleName == "hod" && user.CollegeId.HasValue && user.DepartmentId.HasValue)
        {
            _context.Set<Hod>().Add(new Hod
            {
                UserId = user.Id,
                DepartmentId = user.DepartmentId.Value,
                CollegeId = user.CollegeId.Value,
                Qualification = request.Qualification ?? "",
                YearsOfExperience = request.YearsOfExperience ?? 0,
                Status = request.IsActive ? "Active" : "Inactive",
                IsActive = request.IsActive
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

        await _context.Entry(user).Reference(u => u.DepartmentEntity).LoadAsync();
        await _context.Entry(user).Reference(u => u.CollegeEntity).LoadAsync();

        var response = _mapper.Map<UserResponse>(user);
        await PopulateRoleDetailsAsync(new List<UserResponse> { response });
        return response;
    }

    public async Task<UserResponse> UpdateUserAsync(Guid id, UpdateUserRequest request, Guid? collegeId = null)
    {
        var query = _context.Set<User>()
            .Include(u => u.Role)
            .Where(u => u.Id == id && !u.IsDeleted);

        if (collegeId.HasValue)
            query = query.Where(u => u.CollegeId == collegeId.Value);

        var user = await query.FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("User not found");

        var emailExists = await _context.Set<User>().AsNoTracking()
            .AnyAsync(u => u.Email == request.Email && u.Id != id && !u.IsDeleted);

        if (emailExists)
            throw new ConflictException("Email is already in use by another user");

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

        var role = await _context.Set<Role>().AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.RoleId && !r.IsDeleted);
        if (role == null)
            throw new InvalidOperationException("Role is invalid");

        var roleName = role.Name.ToLowerInvariant();
        var isSuperAdmin = roleName == "superadmin";
        var isStudent = roleName == "student";
        var isGuide = roleName == "guide";
        var isHod = roleName == "hod";
        var needsCollegeDept = isStudent || isGuide || isHod;

        if (!isSuperAdmin && !request.CollegeId.HasValue)
            throw new InvalidOperationException("College is required for this role");

        if (needsCollegeDept && !request.DepartmentId.HasValue)
            throw new InvalidOperationException("Department is required for this role");

        if (isStudent)
        {
            var studentId = !string.IsNullOrWhiteSpace(request.EmployeeId) ? request.EmployeeId : request.Enrollment;
            if (string.IsNullOrWhiteSpace(studentId))
                throw new InvalidOperationException("Student ID is required for the Student role");
            if (!request.GuideId.HasValue)
                throw new InvalidOperationException("Assigned guide is required for the Student role");
            if (!request.AcademicYearId.HasValue)
                throw new InvalidOperationException("Academic Year is required for the Student role");
            if (!request.SemesterId.HasValue)
                throw new InvalidOperationException("Semester is required for the Student role");
        }

        if (isStudent && request.AcademicYearId.HasValue)
        {
            var academicYearExists = await _context.Set<AcademicYear>().AsNoTracking()
                .AnyAsync(a => a.Id == request.AcademicYearId.Value && !a.IsDeleted);
            if (!academicYearExists)
                throw new KeyNotFoundException("Selected academic year not found");
        }

        if (isStudent && request.SemesterId.HasValue)
        {
            var semesterExists = await _context.Set<Semester>().AsNoTracking()
                .AnyAsync(s => s.Id == request.SemesterId.Value && !s.IsDeleted);
            if (!semesterExists)
                throw new KeyNotFoundException("Selected semester not found");
        }

        var effectiveEmployeeId = isStudent
            ? (!string.IsNullOrWhiteSpace(request.EmployeeId) ? request.EmployeeId : request.Enrollment)
            : request.EmployeeId;

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.IsActive = request.IsActive;
        user.RoleId = request.RoleId;
        user.CollegeId = request.CollegeId;
        user.DepartmentId = request.DepartmentId;
        user.EmployeeId = effectiveEmployeeId;
        user.PhoneNumber = request.PhoneNumber;
        user.Designation = request.Designation;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        if (isStudent)
        {
            var student = await _context.Set<StudentProfile>()
                .FirstOrDefaultAsync(sp => sp.UserId == user.Id && !sp.IsDeleted);

            if (student == null)
            {
                student = new StudentProfile { UserId = user.Id };
                _context.Set<StudentProfile>().Add(student);
            }

            student.Enrollment = !string.IsNullOrWhiteSpace(request.Enrollment) ? request.Enrollment : (request.EmployeeId ?? "");
            student.Department = request.DepartmentId.HasValue ? await GetDepartmentNameAsync(request.DepartmentId.Value) : "";
            student.Institution = request.CollegeId.HasValue ? await GetCollegeNameAsync(request.CollegeId.Value) : "";
            student.ResearchTopic = request.ResearchTopic;
            student.GuideId = request.GuideId;
            student.AcademicYearId = request.AcademicYearId;
            student.SemesterId = request.SemesterId;
            student.Section = request.Section;
            student.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else if (isGuide)
        {
            var guide = await _context.Set<GuideProfile>()
                .FirstOrDefaultAsync(gp => gp.UserId == user.Id && !gp.IsDeleted);

            if (guide == null)
            {
                guide = new GuideProfile { UserId = user.Id };
                _context.Set<GuideProfile>().Add(guide);
            }

            guide.Department = request.DepartmentId.HasValue ? await GetDepartmentNameAsync(request.DepartmentId.Value) : "";
            guide.Institution = request.CollegeId.HasValue ? await GetCollegeNameAsync(request.CollegeId.Value) : "";
            guide.Specialization = request.Specialization ?? "";
            guide.Bio = request.Bio ?? "";
            guide.Designation = request.Designation ?? "";
            guide.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else if (isHod)
        {
            var hod = await _context.Set<Hod>()
                .FirstOrDefaultAsync(h => h.UserId == user.Id && !h.IsDeleted);

            if (hod == null)
            {
                hod = new Hod
                {
                    UserId = user.Id,
                    DepartmentId = request.DepartmentId.GetValueOrDefault(),
                    CollegeId = request.CollegeId.GetValueOrDefault()
                };
                _context.Set<Hod>().Add(hod);
            }

            hod.DepartmentId = request.DepartmentId.GetValueOrDefault();
            hod.CollegeId = request.CollegeId.GetValueOrDefault();
            hod.Qualification = request.Qualification ?? "";
            hod.YearsOfExperience = request.YearsOfExperience ?? 0;
            hod.Status = request.IsActive ? "Active" : "Inactive";
            hod.IsActive = request.IsActive;
            hod.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        await _auditLogService.LogAsync(user.Id, "User Updated", "User", user.Id.ToString(), null, request.FullName);

        await _context.Entry(user).Reference(u => u.DepartmentEntity).LoadAsync();
        await _context.Entry(user).Reference(u => u.CollegeEntity).LoadAsync();

        var response = _mapper.Map<UserResponse>(user);
        await PopulateRoleDetailsAsync(new List<UserResponse> { response });
        return response;
    }

    public async Task DeleteUserAsync(Guid id, Guid? collegeId = null)
    {
        _logger.LogInformation("DeleteUserAsync called with Id: {UserId}", id);

        var query = _context.Set<User>().Where(u => u.Id == id);
        if (collegeId.HasValue)
            query = query.Where(u => u.CollegeId == collegeId.Value);

        var user = await query.FirstOrDefaultAsync();

        if (user == null)
        {
            _logger.LogWarning("DeleteUserAsync: No user found with Id {UserId}. The row may have been already deleted from the Users table, or the frontend sent an invalid GUID.", id);
            throw new KeyNotFoundException("User not found");
        }

        if (user.IsDeleted)
        {
            _logger.LogInformation("DeleteUserAsync: User {UserId} ({Email}) was previously soft-deleted (IsDeleted=true). Proceeding with permanent hard delete.", id, user.Email);
        }
        else
        {
            _logger.LogInformation("DeleteUserAsync: Found active user {UserId} ({Email}). Proceeding with hard delete.", id, user.Email);
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Set nullable FK references to null so they don't block deletion
            var auditLogs = await _context.Set<AuditLog>().Where(x => x.UserId == id).ToListAsync();
            foreach (var al in auditLogs) al.UserId = null;

            var backupRecords = await _context.Set<BackupRecord>().Where(x => x.CreatedByUserId == id).ToListAsync();
            foreach (var br in backupRecords) br.CreatedByUserId = null;

            var departmentProfiles = await _context.Set<DepartmentProfile>().Where(x => x.HodUserId == id).ToListAsync();
            foreach (var dp in departmentProfiles) dp.HodUserId = null;

            var departments = await _context.Set<Department>().Where(x => x.HodId == id).ToListAsync();
            foreach (var d in departments) d.HodId = null;

            var studentProfilesByGuide = await _context.Set<StudentProfile>().Where(x => x.GuideId == id).ToListAsync();
            foreach (var sp in studentProfilesByGuide) sp.GuideId = null;

            var emailLogs = await _context.Set<EmailLog>().Where(x => x.UserId == id).ToListAsync();
            foreach (var el in emailLogs) el.UserId = null;

            var taskItemsByAssignee = await _context.Set<TaskItem>().Where(x => x.AssignedToId == id).ToListAsync();
            foreach (var ti in taskItemsByAssignee) ti.AssignedToId = null;

            // 2. Delete / nullify entities with FK to User or its owned projects

            // DocumentComment: nullify self-referencing ParentCommentId for replies to this user's comments
            var userCommentIds = await _context.Set<DocumentComment>()
                .Where(x => x.UserId == id)
                .Select(x => x.Id)
                .ToListAsync();
            if (userCommentIds.Count != 0)
            {
                var replies = await _context.Set<DocumentComment>()
                    .Where(x => x.ParentCommentId != null && userCommentIds.Contains(x.ParentCommentId.Value))
                    .ToListAsync();
                foreach (var r in replies) r.ParentCommentId = null;
            }
            _context.RemoveRange(await _context.Set<DocumentComment>().Where(x => x.UserId == id).ToListAsync());

            // DocumentReview (GuideId FK)
            _context.RemoveRange(await _context.Set<DocumentReview>().Where(x => x.GuideId == id).ToListAsync());

            // ChapterComment (UserId FK)
            _context.RemoveRange(await _context.Set<ChapterComment>().Where(x => x.UserId == id).ToListAsync());

            // MeetingParticipant (UserId FK)
            _context.RemoveRange(await _context.Set<MeetingParticipant>().Where(x => x.UserId == id).ToListAsync());

            // ApprovalHistory (GuideId FK)
            _context.RemoveRange(await _context.Set<ApprovalHistory>().Where(x => x.GuideId == id).ToListAsync());

            // LoginHistory (UserId FK)
            _context.RemoveRange(await _context.Set<LoginHistory>().Where(x => x.UserId == id).ToListAsync());

            // Notification (UserId FK)
            _context.RemoveRange(await _context.Set<Notification>().Where(x => x.UserId == id).ToListAsync());

            // ProjectMember (UserId FK — user is a member of projects they don't own)
            _context.RemoveRange(await _context.Set<ProjectMember>().Where(x => x.UserId == id).ToListAsync());

            // Collect UploadedDocument IDs owned by this user (for DocumentChunk cascade)
            var uploadedDocIds = await _context.Set<UploadedDocument>()
                .Where(x => x.UploadedByUserId == id)
                .Select(x => x.Id)
                .ToListAsync();
            if (uploadedDocIds.Count != 0)
                _context.RemoveRange(await _context.Set<DocumentChunk>().Where(x => uploadedDocIds.Contains(x.UploadedDocumentId)).ToListAsync());

            // Collect LiteratureReview IDs owned by this user (for AnalysisHistory cascade)
            var litReviewIds = await _context.Set<LiteratureReview>().Where(x => x.StudentId == id).Select(x => x.Id).ToListAsync();
            if (litReviewIds.Count != 0)
                _context.RemoveRange(await _context.Set<AnalysisHistory>().Where(x => litReviewIds.Contains(x.LiteratureReviewId)).ToListAsync());

            // UploadedDocument (UploadedByUserId FK)
            _context.RemoveRange(await _context.Set<UploadedDocument>().Where(x => x.UploadedByUserId == id).ToListAsync());

            // LiteratureReview (StudentId FK)
            _context.RemoveRange(await _context.Set<LiteratureReview>().Where(x => x.StudentId == id).ToListAsync());

            // ProjectDocument (UploaderId FK)
            _context.RemoveRange(await _context.Set<ProjectDocument>().Where(x => x.UploaderId == id).ToListAsync());

            // Review (GuideId FK)
            _context.RemoveRange(await _context.Set<Review>().Where(x => x.GuideId == id).ToListAsync());

            // Meeting (GuideId FK — user as a guide)
            _context.RemoveRange(await _context.Set<Meeting>().Where(x => x.GuideId == id).ToListAsync());

            // Project (StudentId FK — owned projects; EF Core cascade handles TaskItem,
            // Milestone, Review, Chapter, ChapterComment, ProjectMember, ProjectDocument
            // through default cascade behaviors)
            _context.RemoveRange(await _context.Set<Project>().Where(x => x.StudentId == id).ToListAsync());

            // 4. Delete remaining reference entities

            // ProjectAllocation (StudentId / GuideId / AllocatedByUserId FK)
            _context.RemoveRange(await _context.Set<ProjectAllocation>()
                .Where(x => x.StudentId == id || x.GuideId == id || x.AllocatedByUserId == id)
                .ToListAsync());

            // DepartmentAnnouncement (CreatedByUserId FK)
            _context.RemoveRange(await _context.Set<DepartmentAnnouncement>().Where(x => x.CreatedByUserId == id).ToListAsync());

            // GlobalAnnouncement (CreatedByUserId FK)
            _context.RemoveRange(await _context.Set<GlobalAnnouncement>().Where(x => x.CreatedByUserId == id).ToListAsync());

            // ResearchTopic (CreatedByUserId FK)
            _context.RemoveRange(await _context.Set<ResearchTopic>().Where(x => x.CreatedByUserId == id).ToListAsync());

            // DepartmentReport (GeneratedByUserId FK)
            _context.RemoveRange(await _context.Set<DepartmentReport>().Where(x => x.GeneratedByUserId == id).ToListAsync());

            // AIProposal (StudentId FK)
            _context.RemoveRange(await _context.Set<AIProposal>().Where(x => x.StudentId == id).ToListAsync());

            // 5. Delete profile entities
            var studentProfile = await _context.Set<StudentProfile>().FirstOrDefaultAsync(x => x.UserId == id);
            if (studentProfile != null) _context.Remove(studentProfile);

            var guideProfile = await _context.Set<GuideProfile>().FirstOrDefaultAsync(x => x.UserId == id);
            if (guideProfile != null) _context.Remove(guideProfile);

            var hodEntity = await _context.Set<Hod>().FirstOrDefaultAsync(x => x.UserId == id);
            if (hodEntity != null) _context.Remove(hodEntity);

            var facultyMember = await _context.Set<FacultyMember>().FirstOrDefaultAsync(x => x.UserId == id);
            if (facultyMember != null) _context.Remove(facultyMember);

            // RefreshToken (UserId FK — default cascade, handled explicitly for clarity)
            _context.RemoveRange(await _context.Set<RefreshToken>().Where(x => x.UserId == id).ToListAsync());

            // 6. Delete the user
            _context.Remove(user);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

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

    private async Task<string> GetDepartmentNameAsync(Guid departmentId)
    {
        return await _context.Set<Department>().AsNoTracking()
            .Where(d => d.Id == departmentId && !d.IsDeleted)
            .Select(d => d.DepartmentName)
            .FirstOrDefaultAsync() ?? "";
    }

    private async Task<string> GetCollegeNameAsync(Guid collegeId)
    {
        return await _context.Set<College>().AsNoTracking()
            .Where(c => c.Id == collegeId && !c.IsDeleted)
            .Select(c => c.Name)
            .FirstOrDefaultAsync() ?? "";
    }
}
