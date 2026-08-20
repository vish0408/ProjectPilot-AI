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
  employeeId: string | null;
  phoneNumber: string | null;
  designation: string | null;
  collegeName: string;
  collegeId: string | null;
  departmentId: string | null;
  accountStatus: string;
}

export interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

export interface ResearchStatistics {
  totalResearchTopics: number;
  activeTopics: number;
  totalCategories: number;
  allocatedProjects: number;
}

export interface ActivityTimelineItem {
  id: string;
  action: string;
  description: string;
  userName: string;
  timestamp: string;
  type: string;
}

export interface UpcomingMeetingItem {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  guideName: string;
}

export interface RecentSubmissionItem {
  id: string;
  studentName: string;
  submissionType: string;
  title: string;
  submittedAt: string;
  status: string;
}

export interface HodDashboardData {
  hodName: string;
  departmentName: string;
  collegeName: string;
  activeResearchProjects: number;
  pendingTopicApprovals: number;
  pendingProposalApprovals: number;
  assignedGuides: number;
  meetingsScheduled: number;
  completedResearch: number;
  departmentsManaged: number;
  notifications: number;
  upcomingDeadlines: number;
  totalGuides: number;
  activeProjects: number;
  completedProjects: number;
  pendingReviews: number;
  totalScholars: number;
  courseworkInProgress: number;
  courseworkCompleted: number;
  researchInProgress: number;
  thesisSubmitted: number;
  completedScholars: number;
  researchStats: ResearchStatistics;
  announcements: DepartmentAnnouncement[];
  recentNotifications: AppNotification[];
  studentProgressChart: ChartData;
  researchStatusChart: ChartData;
  guideWorkloadChart: ChartData;
  monthlyActivityChart: ChartData;
  approvalStatisticsChart: ChartData;
  recentActivity: ActivityTimelineItem[];
  upcomingMeetings: UpcomingMeetingItem[];
  recentSubmissions: RecentSubmissionItem[];
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
  employeeId: string;
  enrollment: string;
  department: string;
  departmentId: string | null;
  collegeId: string | null;
  departmentName: string;
  collegeName: string;
  phoneNumber: string;
  accountStatus: string;
  isActive: boolean;
  researchTopic: string;
  guideName: string | null;
  guideId: string | null;
  guideEmployeeId: string | null;
  projectTitle: string | null;
  projectStatus: string | null;
  completionPercentage: number;
  joiningCohort: string | null;
  researchStageName: string | null;
  requiredCredits: number | null;
  earnedCredits: number | null;
  courseworkStatus: string | null;
  createdAt: string;
}

export interface GuidedStudentItem {
  userId: string;
  fullName: string;
  email: string;
  enrollment: string;
  researchTopic: string;
  researchStageName: string | null;
  projectStatus: string;
  completionPercentage: number;
}

export interface StudentDetail extends HodStudentSummary {
  college: string;
  projectId: string | null;
  emailVerified: boolean;
  invitationSentAt: string | null;
  activatedAt: string | null;
  registrationDate: string | null;
  phdMode: string | null;
  researchStageId: string | null;
  passedPapers: number | null;
  pendingPapers: number | null;
  lastLoginAt: string | null;
  roles: string[];
}

export interface HodGuideSummary {
  userId: string;
  fullName: string;
  email: string;
  employeeId: string;
  phoneNumber: string;
  department: string;
  departmentId: string | null;
  collegeId: string | null;
  departmentName: string;
  collegeName: string;
  specialization: string;
  designation: string;
  isAvailable: boolean;
  isActive: boolean;
  accountStatus: string;
  assignedStudents: number;
  activeProjects: number;
  completedProjects: number;
}

export interface GuideDetail extends HodGuideSummary {
  college: string;
  bio: string;
  institution: string;
  emailVerified: boolean;
  invitationSentAt: string | null;
  activatedAt: string | null;
  lastLoginAt: string | null;
  maxCapacity: number;
  pendingReviews: number;
  students: GuidedStudentItem[];
  createdAt: string;
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
  code?: string;
  description: string;
  disciplineGroup?: string;
  sortOrder?: number;
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
  departmentId: string | null;
  departmentName: string | null;
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
