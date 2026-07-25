export interface GuideProfileDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  bio: string;
  department: string;
  institution: string;
  specialization: string;
  designation: string;
  isAvailable: boolean;
}

export interface AssignedStudentSummary {
  userId: string;
  fullName: string;
  email: string;
  enrollment: string;
  department: string;
  researchTopic: string;
  projectTitle: string | null;
  projectStatus: string | null;
  projectId: string | null;
  completionPercentage: number;
  totalChapters: number;
  approvedChapters: number;
}

export interface PendingReviewSummary {
  projectId: string;
  projectTitle: string;
  studentName: string;
  reviewId: string;
  type: string;
  submittedAt: string | null;
}

export interface UpcomingMeetingSummary {
  meetingId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  status: string;
}

export interface ThesisDocumentSummary {
  documentId: string;
  projectId: string;
  projectTitle: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  studentId: string;
  studentName: string;
  enrollment: string;
  department: string;
  researchTopic: string;
  reviewStatus: string | null;
  version: number;
}

export interface GuideDashboardData {
  totalAssignedStudents: number;
  projectsUnderReview: number;
  pendingReviews: number;
  upcomingMeetings: number;
  assignedStudents: AssignedStudentSummary[];
  pendingReviewList: PendingReviewSummary[];
  upcomingMeetingsList: UpcomingMeetingSummary[];
  recentNotifications: AppNotification[];
  pendingThesisReviews: ThesisDocumentSummary[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  projectId: string;
  projectTitle: string;
  guideId: string;
  guideName: string;
  status: string;
  notes: string;
  reviewedAt: string | null;
  createdAt: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: string;
  order: number;
  status: string;
  createdAt: string;
  comments: ChapterComment[];
}

export interface ChapterComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  lineNumber: number | null;
  createdAt: string;
}

export interface Meeting {
  id: string;
  guideId: string;
  guideName: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  agenda: string;
  meetingNotes: string;
  meetingLink: string;
  status: string;
  createdAt: string;
  participants: MeetingParticipant[];
}

export interface MeetingParticipant {
  id: string;
  userId: string;
  userName: string;
  email: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  content: string;
  parentCommentId: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string | null;
  replies: DocumentComment[];
}

export interface ApprovalHistoryEntry {
  id: string;
  projectId: string;
  projectTitle: string;
  chapterId: string | null;
  chapterTitle: string | null;
  guideId: string;
  guideName: string;
  action: string;
  comments: string;
  previousStatus: string;
  createdAt: string;
}
