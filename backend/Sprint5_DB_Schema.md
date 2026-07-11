# Sprint 5 - Database Schema Summary

## New Tables (10)

### Colleges
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| Name | nvarchar(max) | NOT NULL |
| Code | nvarchar(450) | UNIQUE INDEX |
| Address | nvarchar(max) | NOT NULL |
| Phone | nvarchar(max) | NOT NULL |
| Email | nvarchar(max) | NOT NULL |
| Website | nvarchar(max) | NOT NULL |
| IsActive | bit | NOT NULL |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

### Departments
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| Name | nvarchar(max) | NOT NULL |
| Code | nvarchar(450) | UNIQUE INDEX |
| Description | nvarchar(max) | NOT NULL |
| CollegeId | uniqueidentifier | FK → Colleges(Id), CASCADE |
| IsActive | bit | NOT NULL |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

### AcademicYears
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| Name | nvarchar(450) | UNIQUE INDEX |
| StartDate | datetime2 | NOT NULL |
| EndDate | datetime2 | NOT NULL |
| IsCurrent | bit | NOT NULL |
| IsActive | bit | NOT NULL |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

### Semesters
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| Name | nvarchar(max) | NOT NULL |
| Number | int | NOT NULL |
| StartDate | datetime2 | NOT NULL |
| EndDate | datetime2 | NOT NULL |
| AcademicYearId | uniqueidentifier | FK → AcademicYears(Id), CASCADE |
| IsCurrent | bit | NOT NULL |
| IsActive | bit | NOT NULL |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

### FacultyMembers
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| UserId | uniqueidentifier | FK → Users(Id), NO ACTION, UNIQUE |
| DepartmentId | uniqueidentifier | FK → Departments(Id), NO ACTION |
| Designation | nvarchar(max) | NOT NULL |
| Specialization | nvarchar(max) | NOT NULL |
| JoiningDate | datetime2 | NOT NULL |
| IsActive | bit | NOT NULL |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

### AuditLogs
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| UserId | uniqueidentifier | FK → Users(Id), SET NULL, INDEX |
| Action | nvarchar(max) | NOT NULL |
| EntityName | nvarchar(max) | NOT NULL |
| EntityId | nvarchar(max) | NOT NULL |
| OldValues | nvarchar(max) | NOT NULL |
| NewValues | nvarchar(max) | NOT NULL |
| IpAddress | nvarchar(max) | NOT NULL |
| Timestamp | datetime2 | NOT NULL, INDEX |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

### SystemSettings
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| Key | nvarchar(450) | UNIQUE INDEX |
| Value | nvarchar(max) | NOT NULL |
| Description | nvarchar(max) | NOT NULL |
| Group | nvarchar(max) | NOT NULL |
| IsActive | bit | NOT NULL |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

### Permissions
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| Name | nvarchar(450) | UNIQUE INDEX |
| Description | nvarchar(max) | NOT NULL |
| Group | nvarchar(max) | NOT NULL |
| IsActive | bit | NOT NULL |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

### RolePermissions
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| RoleId | uniqueidentifier | FK → Roles(Id), NO ACTION |
| PermissionId | uniqueidentifier | FK → Permissions(Id), NO ACTION |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |
| **Unique Index** | | **(RoleId, PermissionId)** |

### GlobalAnnouncements
| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PK |
| Title | nvarchar(max) | NOT NULL |
| Content | nvarchar(max) | NOT NULL |
| Priority | nvarchar(max) | NOT NULL |
| Status | nvarchar(max) | NOT NULL |
| PublishedAt | datetime2 | NULL |
| CreatedByUserId | uniqueidentifier | FK → Users(Id), NO ACTION |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |
| IsDeleted | bit | NOT NULL |

## Modified Tables (1)

### Roles
| Column | Type | Change |
|--------|------|--------|
| Description | nvarchar(max) | ADDED |
| IsActive | bit | ADDED |

## Entity Relationships

```
College 1──* Department
Department 1──* FacultyMember
AcademicYear 1──* Semester
Role *──* Permission (via RolePermission)
User *──1 Role
FacultyMember 1──1 User
GlobalAnnouncement *──1 User (CreatedBy)
AuditLog *──1 User (optional)
```
