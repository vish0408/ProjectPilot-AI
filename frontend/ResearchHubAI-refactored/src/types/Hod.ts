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
  activeResearchProjects: number;
  pendingTopicApprovals: number;
  pendingProposalApprovals: number;
  assignedGuides: number;
  meetingsScheduled: number;
  completedResearch: number;
  departmentsManaged: number;
  notifications: number;
  upcomingDeadlines: number;
  announcements: DepartmentAnnouncement[];
  researchStats: ResearchStatistics;
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

export interface ResearchStatistics {
  totalResearchTopics: number;
  activeTopics: number;
  totalCategories: number;
  allocatedProjects: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
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

export interface StudentDetail {
  userId: string;
  fullName: string;
  email: string;
  enrollment: string;
  department: string;
  college: string;
  phoneNumber: string;
  researchTopic: string;
  guideName: string | null;
  guideId: string | null;
  projectTitle: string | null;
  projectId: string | null;
  projectStatus: string | null;
  completionPercentage: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: string[];
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

export interface GuideDetail {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  college: string;
  specialization: string;
  designation: string;
  bio: string;
  institution: string;
  isAvailable: boolean;
  assignedStudents: number;
  maxCapacity: number;
  completedProjects: number;
  activeProjects: number;
  pendingReviews: number;
  students: GuidedStudentItem[];
  createdAt: string;
}

export interface GuidedStudentItem {
  userId: string;
  fullName: string;
  email: string;
  researchTopic: string;
  projectStatus: string;
  completionPercentage: number;
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

// Proposal types
export interface HodProposal {
  id: string;
  title: string;
  abstract: string;
  status: string;
  remarks: string | null;
  studentName: string;
  studentId: string;
  guideName: string | null;
  guideId: string | null;
  department: string;
  version: number;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
  comments: ProposalComment[];
}

export interface ProposalComment {
  id: string;
  comment: string;
  userName: string;
  createdAt: string;
}

export interface ReviewProposalRequest {
  action: string;
  remarks?: string;
}

export interface AddProposalCommentRequest {
  comment: string;
}

// Progress types
export interface HodProgressData {
  students: StudentProgressItem[];
  delayedProjects: DelayedProjectItem[];
  upcomingDeadlines: UpcomingDeadlineItem[];
  statistics: ProgressStatistics;
}

export interface StudentProgressItem {
  userId: string;
  fullName: string;
  email: string;
  enrollment: string;
  projectTitle: string;
  guideName: string;
  completionPercentage: number;
  status: string;
  milestonesCompleted: number;
  totalMilestones: number;
  startDate: string | null;
  targetEndDate: string | null;
  isDelayed: boolean;
}

export interface DelayedProjectItem {
  projectId: string;
  title: string;
  studentName: string;
  guideName: string;
  completionPercentage: number;
  targetEndDate: string;
  daysOverdue: number;
}

export interface UpcomingDeadlineItem {
  projectId: string;
  title: string;
  studentName: string;
  deadlineType: string;
  deadline: string;
  daysRemaining: number;
}

export interface ProgressStatistics {
  totalProjects: number;
  onTrack: number;
  delayed: number;
  completed: number;
  averageCompletion: number;
}

// Meeting types (reuse existing or local)
export interface HodMeeting {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  agenda: string;
  meetingNotes: string | null;
  meetingLink: string | null;
  status: string;
  guideId: string;
  guideName: string;
  participants: MeetingParticipant[];
  createdAt: string;
}

export interface MeetingParticipant {
  id: string;
  userId: string;
  userName: string;
}
