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
        _logger.LogInformation("DeleteUserAsync called with Id: {UserId}", id);

        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Id == id);

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
}
