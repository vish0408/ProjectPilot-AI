# ResearchHub AI — Database Schema

## ORM

- **Entity Framework Core 10**
- **Database provider:** SQL Server
- **Migrations folder:** `backend/src/.../Infrastructure/Migrations/`
- All entities inherit from `BaseEntity` (Id, CreatedAt, UpdatedAt, IsDeleted)

## Entity List (48 tables)

### Auth & Users
| Table | Key Fields |
|-------|-----------|
| Users | Id, Email, PasswordHash, FullName, RoleId (FK) |
| Roles | Id, Name |
| RefreshTokens | Id, Token, UserId (FK), ExpiresAt |
| RolePermissions | RoleId (FK), PermissionId (FK) |
| Permissions | Id, Name |

### Student Workspace
| Table | Key Fields |
|-------|-----------|
| StudentProfiles | Id, UserId (FK), GuideId (FK), EnrollmentNo, Department |
| Projects | Id, StudentId (FK), Title, Status |
| ProjectMembers | ProjectId (FK), UserId (FK) |
| TaskItems | Id, ProjectId (FK), AssignedToId (FK), Title, Status |
| Milestones | Id, ProjectId (FK), Title, DueDate, Status |
| ProjectDocuments | Id, ProjectId (FK), UploaderId (FK), FileName |
| Chapters | Id, ProjectId (FK), Title, Content, Status |
| ChapterComments | Id, ChapterId, UserId, Content |
| Meetings | Id, GuideId (FK), Title, DateTime, Status |
| MeetingParticipants | MeetingId (FK), UserId (FK) |
| ApprovalHistory | Id, ProjectId (FK), ChapterId (FK), GuideId (FK), Status |
| Reviews | Id, ProjectId (FK), GuideId (FK), Rating, Comment |

### HOD Workspace
| Table | Key Fields |
|-------|-----------|
| DepartmentProfiles | Id, DepartmentName, HodUserId (FK) |
| DepartmentSettings | Id, DepartmentProfileId (FK) |
| ResearchCategories | Id, DepartmentProfileId (FK), Name |
| ResearchTopics | Id, CategoryId (FK), Title, Description |
| ProjectAllocations | Id, StudentId (FK), GuideId (FK), ProjectId (FK) |
| DepartmentAnnouncements | Id, DepartmentProfileId (FK), Title, Content |
| DepartmentReports | Id, DepartmentProfileId (FK), Title, ReportType, Data (JSON) |

### Admin Workspace
| Table | Key Fields |
|-------|-----------|
| Colleges | Id, Name, Code |
| Departments | Id, Name, Code, CollegeId (FK) |
| AcademicYears | Id, Name, IsCurrent |
| Semesters | Id, AcademicYearId (FK), Name, IsCurrent |
| FacultyMembers | Id, UserId (FK), DepartmentId (FK) |
| SystemSettings | Id, Key (unique), Value, Group |
| GlobalAnnouncements | Id, Title, Content, IsPublished |
| AuditLogs | Id, UserId (FK), Action, EntityName, EntityId, Timestamp, IpAddress |
| Notifications | Id, UserId (FK), Title, Message, Type, IsRead |

### AI Entities (excluded from current scope)
| Table | Key Fields |
|-------|-----------|
| AIProposals | Id, StudentId (FK), Title, Content |
| LiteratureReviews | Id, StudentId (FK), Title |
| UploadedDocuments | Id, LiteratureReviewId (FK), FileName |
| DocumentChunks, AnalysisHistory, ChatSessions, ChatMessages, Citations, DocumentReferences, ConversationMemories | Various AI-related entities |

### Backup & Restore (new)
| Table | Key Fields |
|-------|-----------|
| BackupRecords | Id, FileName, FilePath, FileSizeBytes, Status, CreatedByUserId (FK), CompletedAt |

## Key Indexes
- Users.Email (unique)
- RefreshTokens.Token (unique)
- Notifications.UserId
- AuditLogs.Timestamp
- BackupRecords.Status, BackupRecords.CreatedAt
