# ResearchHub AI — API Reference

Base URL: `/api` (development) or production URL

## Authentication

All endpoints except `POST /auth/login`, `POST /auth/refresh` require a Bearer JWT.

```
Authorization: Bearer <token>
```

## Endpoint Groups

### Auth (`/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /login | Public | Login, returns JWT |
| POST | /register | Admin | Register new user |
| POST | /refresh | Public | Refresh JWT |
| POST | /logout | Any | Logout, invalidate refresh token |
| GET | /me | Any | Get current user profile |

### Admin (`/admin/*`)
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard | Dashboard stats with charts data |
| CRUD | /colleges, /departments, /academic-years, /semesters, /faculties | Full CRUD |
| CRUD | /users, /roles, /permissions | User management |
| GET | /audit-logs, /audit-logs/{id} | Read audit trail |
| CRUD | /settings | System settings |
| CRUD | /announcements | Global announcements |
| POST | /backup/create | Create database backup |
| GET | /backup | List backup history |
| DELETE | /backup/{id} | Delete backup |

### HOD (`/hod/*`)
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard | Department dashboard |
| GET | /students, /guides | List with search/filter |
| POST | /guides/assign | Assign guide to student |
| CRUD | /allocations | Project allocations |
| CRUD | /research-categories, /research-topics | Research topics |
| CRUD | /announcements | Department announcements |
| POST | /reports/generate | Generate department report |
| GET | /profile, PUT | HOD profile CRUD |

### Guide (`/guide/*`, `/dashboard/guide`)
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard | Guide dashboard |
| GET | /profile, PUT | Guide profile |
| GET | /reviews/my, POST | Reviews |
| GET | /chapters/{id}/comments, POST, DELETE | Chapter comments |
| GET | /approval-history/project/{id} | Approval history |

### Student (`/*`, `/dashboard/student`)
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard/student | Student dashboard |
| GET | /projects/my, CRUD | Project management |
| CRUD | /projects/{id}/tasks, milestones, documents | Project details |
| CRUD | /notifications | User notifications |

### Notifications (`/notifications`)
| Method | Path | Description |
|--------|------|-------------|
| GET | / | List my notifications (max 50) |
| GET | /unread-count | Get unread count |
| POST | / | Create notification |
| PUT | /mark-read | Mark specific as read |
| PUT | /mark-all-read | Mark all as read |
| DELETE | /{id} | Delete notification |
