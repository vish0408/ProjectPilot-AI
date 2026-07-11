export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    register: "/auth/register",
    refresh: "/auth/refresh",
  },
  student: {
    profile: "/student/profile",
    dashboard: "/dashboard/student",
  },
  guide: {
    profile: "/guide/profile",
    dashboard: "/dashboard/guide",
  },
  reviews: {
    my: "/reviews/my",
    project: (id: string) => `/reviews/project/${id}`,
  },
  chapters: {
    list: (id: string) => `/projects/${id}/chapters`,
    detail: (id: string) => `/chapters/${id}`,
    status: (id: string) => `/chapters/${id}/status`,
    comments: {
      list: (id: string) => `/chapters/${id}/comments`,
      add: (id: string) => `/chapters/${id}/comments`,
      delete: (chapterId: string, commentId: string) => `/chapters/${chapterId}/comments/${commentId}`,
    },
  },
  approvalHistory: {
    project: (id: string) => `/approval-history/project/${id}`,
    chapter: (id: string) => `/approval-history/chapter/${id}`,
  },
  projects: {
    list: "/projects/my",
    detail: (id: string) => `/projects/${id}`,
    members: {
      add: (id: string) => `/projects/${id}/members`,
      remove: (id: string, memberId: string) => `/projects/${id}/members/${memberId}`,
    },
    tasks: {
      list: (id: string) => `/projects/${id}/tasks`,
      detail: (projectId: string, taskId: string) => `/projects/${projectId}/tasks/${taskId}`,
    },
    milestones: {
      list: (id: string) => `/projects/${id}/milestones`,
      detail: (projectId: string, milestoneId: string) => `/projects/${projectId}/milestones/${milestoneId}`,
    },
    documents: {
      list: (id: string) => `/projects/${id}/documents`,
      detail: (projectId: string, docId: string) => `/projects/${projectId}/documents/${docId}`,
    },
  },
  notifications: {
    list: "/notifications",
    unreadCount: "/notifications/unread-count",
    markRead: "/notifications/mark-read",
    markAllRead: "/notifications/mark-all-read",
  },
  students: {
    list: "/students",
    detail: (id: string) => `/students/${id}`,
  },
  guides: {
    list: "/guides",
    detail: (id: string) => `/guides/${id}`,
  },
  research: {
    list: "/research",
    detail: (id: string) => `/research/${id}`,
    chapters: (id: string) => `/research/${id}/chapters`,
  },
  meetings: {
    list: "/meetings",
    detail: (id: string) => `/meetings/${id}`,
  },
  hod: {
    profile: "/hod/profile",
    dashboard: "/hod/dashboard",
    students: "/hod/students",
    guides: "/hod/guides",
    guidesAssign: "/hod/guides/assign",
    allocations: "/hod/allocations",
    researchCategories: "/hod/research-categories",
    researchTopics: "/hod/research-topics",
    announcements: "/hod/announcements",
    announcementsPublish: (id: string) => `/hod/announcements/${id}/publish`,
    announcementsExpire: (id: string) => `/hod/announcements/${id}/expire`,
    reports: "/hod/reports",
    reportsGenerate: "/hod/reports/generate",
  },
  ai: {
    chat: "/ai/chat",
    review: "/ai/review",
  },
} as const;
