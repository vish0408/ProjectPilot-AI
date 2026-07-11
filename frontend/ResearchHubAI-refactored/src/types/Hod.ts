export interface HodProfileDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  departmentName: string;
  institution: string;
  description: string;
  contactEmail: string;
  location: string;
}

export interface HodDashboardData {
  totalStudents: number;
  totalGuides: number;
  activeProjects: number;
  completedProjects: number;
  pendingReviews: number;
  announcements: DepartmentAnnouncement[];
  researchStats: ResearchStatistics;
  recentNotifications: AppNotification[];
}

export interface ResearchStatistics {
  totalResearchTopics: number;
  activeTopics: number;
  totalCategories: number;
  allocatedProjects: number;
}

export interface DepartmentAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  createdByName: string;
  createdAt: string;
}

export interface HodStudentSummary {
  userId: string;
  fullName: string;
  email: string;
  enrollment: string;
  department: string;
  researchTopic: string;
  guideName: string | null;
  guideId: string | null;
  projectTitle: string | null;
  projectStatus: string | null;
  completionPercentage: number;
  createdAt: string;
}

export interface HodGuideSummary {
  userId: string;
  fullName: string;
  email: string;
  department: string;
  specialization: string;
  designation: string;
  isAvailable: boolean;
  assignedStudents: number;
  completedProjects: number;
}

export interface ProjectAllocation {
  id: string;
  studentId: string;
  studentName: string;
  guideId: string;
  guideName: string;
  projectId: string | null;
  projectTitle: string | null;
  status: string;
  allocatedAt: string;
  remarks: string;
  allocatedByName: string;
}

export interface ResearchCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  researchTopicCount: number;
}

export interface ResearchTopic {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  createdByName: string;
  createdAt: string;
}

export interface DepartmentReport {
  id: string;
  title: string;
  reportType: string;
  data: string;
  generatedAt: string;
  generatedByName: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
