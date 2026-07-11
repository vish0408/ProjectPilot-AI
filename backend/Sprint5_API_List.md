# Sprint 5 - Super Admin API List

All endpoints require `[Authorize(Roles = "Admin")]` and are prefixed with `/admin/`.

## Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Get admin dashboard analytics |

## Colleges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/colleges` | List all colleges |
| GET | `/admin/colleges/{id}` | Get college by ID |
| POST | `/admin/colleges` | Create college |
| PUT | `/admin/colleges/{id}` | Update college |
| DELETE | `/admin/colleges/{id}` | Soft delete college |

## Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/departments` | List all departments |
| GET | `/admin/departments/{id}` | Get department by ID |
| POST | `/admin/departments` | Create department |
| PUT | `/admin/departments/{id}` | Update department |
| DELETE | `/admin/departments/{id}` | Soft delete department |

## Academic Years
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/academic-years` | List all academic years |
| GET | `/admin/academic-years/{id}` | Get academic year by ID |
| POST | `/admin/academic-years` | Create academic year |
| PUT | `/admin/academic-years/{id}` | Update academic year |
| DELETE | `/admin/academic-years/{id}` | Soft delete academic year |
| PUT | `/admin/academic-years/{id}/set-current` | Set as current academic year |

## Semesters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/semesters` | List all semesters |
| GET | `/admin/semesters/{id}` | Get semester by ID |
| GET | `/admin/semesters/by-academic-year/{academicYearId}` | List semesters by academic year |
| POST | `/admin/semesters` | Create semester |
| PUT | `/admin/semesters/{id}` | Update semester |
| DELETE | `/admin/semesters/{id}` | Soft delete semester |
| PUT | `/admin/semesters/{id}/set-current` | Set as current semester |

## Faculties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/faculties` | List all faculty members |
| GET | `/admin/faculties/{id}` | Get faculty member by ID |
| POST | `/admin/faculties` | Create faculty member |
| PUT | `/admin/faculties/{id}` | Update faculty member |
| DELETE | `/admin/faculties/{id}` | Soft delete faculty member |

## User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| GET | `/admin/users/{id}` | Get user by ID |
| POST | `/admin/users` | Create user (with password hashing) |
| PUT | `/admin/users/{id}` | Update user |
| DELETE | `/admin/users/{id}` | Soft delete user |

## Role Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/roles` | List all roles with permission counts |
| GET | `/admin/roles/{id}` | Get role by ID with permissions |
| POST | `/admin/roles` | Create role with permissions |
| PUT | `/admin/roles/{id}` | Update role and permissions |
| DELETE | `/admin/roles/{id}` | Delete role (if no users assigned) |

## Permission Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/permissions` | List all permissions |
| GET | `/admin/permissions/{id}` | Get permission by ID |
| POST | `/admin/permissions` | Create permission |

## Global Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/announcements` | List all announcements |
| GET | `/admin/announcements/{id}` | Get announcement by ID |
| POST | `/admin/announcements` | Create announcement |
| PUT | `/admin/announcements/{id}` | Update announcement |
| PUT | `/admin/announcements/{id}/publish` | Publish announcement |
| DELETE | `/admin/announcements/{id}` | Delete announcement |

## Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/audit-logs` | List all audit logs |
| GET | `/admin/audit-logs/{id}` | Get audit log by ID |

## System Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/settings` | List all settings |
| GET | `/admin/settings/{id}` | Get setting by ID |
| GET | `/admin/settings/by-key/{key}` | Get setting by key |
| PUT | `/admin/settings/{id}` | Update setting |

**Total Endpoints: 50**
