import { apiClient } from "../api/client";
import type { PagedRequest, PagedResponse } from "../types/Pagination";
import {
  HodProfileDto,
  HodDashboardData,
  HodStudentSummary,
  StudentDetail,
  HodGuideSummary,
  GuideDetail,
  ProjectAllocation,
  ResearchCategory,
  ResearchTopic,
  DepartmentAnnouncement,
  DepartmentReport,
  HodProposal,
  ReviewProposalRequest,
  AddProposalCommentRequest,
  ProposalComment,
  HodProgressData,
  HodMeeting,
} from "../types/Hod";

export class HodService {
  // Profile
  async getProfile(): Promise<HodProfileDto> {
    const res = await apiClient.get<HodProfileDto>("/hod/profile");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get profile");
    return res.data;
  }
  async updateProfile(data: Partial<HodProfileDto>): Promise<HodProfileDto> {
    const res = await apiClient.put<HodProfileDto>("/hod/profile", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update profile");
    return res.data;
  }

  // Dashboard
  async getDashboard(): Promise<HodDashboardData> {
    const res = await apiClient.get<HodDashboardData>("/hod/dashboard");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get dashboard");
    return res.data;
  }

  // Students
  async getStudents(search?: string, request?: PagedRequest): Promise<PagedResponse<HodStudentSummary>> {
    const qp = new URLSearchParams();
    if (search) qp.set("search", search);
    if (request?.pageNumber) qp.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) qp.set("pageSize", String(request.pageSize));
    if (request?.sortField) qp.set("sortBy", request.sortField);
    if (request?.statusFilter) qp.set("filterStatus", request.statusFilter);
    const qs = qp.toString();
    const res = await apiClient.get<PagedResponse<HodStudentSummary>>(`/hod/students${qs ? `?${qs}` : ""}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get students");
    return res.data;
  }

  async getStudentDetail(studentUserId: string): Promise<StudentDetail> {
    const res = await apiClient.get<StudentDetail>(`/hod/students/${studentUserId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get student detail");
    return res.data;
  }

  async assignStudentGuide(studentUserId: string, guideId: string, remarks?: string): Promise<void> {
    const res = await apiClient.post(`/hod/students/${studentUserId}/assign-guide`, { guideId, remarks });
    if (!res.success) throw new Error(res.message || "Failed to assign guide");
  }

  async toggleStudentStatus(studentUserId: string, isActive: boolean): Promise<void> {
    const res = await apiClient.put(`/hod/students/${studentUserId}/status?isActive=${isActive}`);
    if (!res.success) throw new Error(res.message || "Failed to update student status");
  }

  // Guides
  async getGuides(): Promise<HodGuideSummary[]> {
    const res = await apiClient.get<HodGuideSummary[]>("/hod/guides");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get guides");
    return res.data;
  }
  
  async getGuideDetail(guideUserId: string): Promise<GuideDetail> {
    const res = await apiClient.get<GuideDetail>(`/hod/guides/${guideUserId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get guide detail");
    return res.data;
  }

  async assignGuide(data: { studentId: string; guideId: string; remarks?: string }): Promise<void> {
    const res = await apiClient.post("/hod/guides/assign", data);
    if (!res.success) throw new Error(res.message || "Failed to assign guide");
  }

  // Allocations
  async getAllocations(): Promise<ProjectAllocation[]> {
    const res = await apiClient.get<ProjectAllocation[]>("/hod/allocations");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get allocations");
    return res.data;
  }
  async createAllocation(data: { studentId: string; guideId: string; projectId?: string; remarks?: string }): Promise<ProjectAllocation> {
    const res = await apiClient.post<ProjectAllocation>("/hod/allocations", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create allocation");
    return res.data;
  }
  async revokeAllocation(id: string): Promise<void> {
    const res = await apiClient.delete(`/hod/allocations/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to revoke allocation");
  }

  // Research Categories
  async getCategories(): Promise<ResearchCategory[]> {
    const res = await apiClient.get<ResearchCategory[]>("/hod/research-categories");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get categories");
    return res.data;
  }
  async createCategory(data: { name: string; description?: string }): Promise<ResearchCategory> {
    const res = await apiClient.post<ResearchCategory>("/hod/research-categories", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create category");
    return res.data;
  }
  async updateCategory(id: string, data: { name: string; description?: string; isActive?: boolean }): Promise<ResearchCategory> {
    const res = await apiClient.put<ResearchCategory>(`/hod/research-categories/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update category");
    return res.data;
  }

  // Research Topics
  async getTopics(categoryId?: string): Promise<ResearchTopic[]> {
    const params = categoryId ? `?categoryId=${categoryId}` : "";
    const res = await apiClient.get<ResearchTopic[]>(`/hod/research-topics${params}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get topics");
    return res.data;
  }
  async createTopic(data: { title: string; description?: string; categoryId: string }): Promise<ResearchTopic> {
    const res = await apiClient.post<ResearchTopic>("/hod/research-topics", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create topic");
    return res.data;
  }
  async updateTopic(id: string, data: { title?: string; description?: string; categoryId?: string; isActive?: boolean }): Promise<ResearchTopic> {
    const res = await apiClient.put<ResearchTopic>(`/hod/research-topics/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update topic");
    return res.data;
  }

  // Announcements
  async getAnnouncements(): Promise<DepartmentAnnouncement[]> {
    const res = await apiClient.get<DepartmentAnnouncement[]>("/hod/announcements");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get announcements");
    return res.data;
  }
  async createAnnouncement(data: { title: string; content: string; priority: string; scheduledAt?: string; expiresAt?: string }): Promise<DepartmentAnnouncement> {
    const res = await apiClient.post<DepartmentAnnouncement>("/hod/announcements", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create announcement");
    return res.data;
  }
  async updateAnnouncement(id: string, data: Partial<DepartmentAnnouncement>): Promise<DepartmentAnnouncement> {
    const res = await apiClient.put<DepartmentAnnouncement>(`/hod/announcements/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update announcement");
    return res.data;
  }
  async publishAnnouncement(id: string): Promise<void> {
    const res = await apiClient.post(`/hod/announcements/${id}/publish`);
    if (!res.success) throw new Error(res.message || "Failed to publish announcement");
  }
  async expireAnnouncement(id: string): Promise<void> {
    const res = await apiClient.post(`/hod/announcements/${id}/expire`);
    if (!res.success) throw new Error(res.message || "Failed to expire announcement");
  }

  // Reports
  async getReports(): Promise<DepartmentReport[]> {
    const res = await apiClient.get<DepartmentReport[]>("/hod/reports");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get reports");
    return res.data;
  }
  async generateReport(reportType: string, title: string): Promise<DepartmentReport> {
    const res = await apiClient.post<DepartmentReport>(`/hod/reports/generate?reportType=${reportType}&title=${encodeURIComponent(title)}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to generate report");
    return res.data;
  }

  // Proposals
  async getProposals(status?: string): Promise<HodProposal[]> {
    const params = status ? `?status=${status}` : "";
    const res = await apiClient.get<HodProposal[]>(`/hod/proposals${params}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get proposals");
    return res.data;
  }
  async getProposalDetail(id: string): Promise<HodProposal> {
    const res = await apiClient.get<HodProposal>(`/hod/proposals/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get proposal detail");
    return res.data;
  }
  async reviewProposal(id: string, data: ReviewProposalRequest): Promise<HodProposal> {
    const res = await apiClient.post<HodProposal>(`/hod/proposals/${id}/review`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to review proposal");
    return res.data;
  }
  async addProposalComment(id: string, data: AddProposalCommentRequest): Promise<ProposalComment> {
    const res = await apiClient.post<ProposalComment>(`/hod/proposals/${id}/comments`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to add comment");
    return res.data;
  }

  // Progress
  async getProgress(): Promise<HodProgressData> {
    const res = await apiClient.get<HodProgressData>("/hod/progress");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get progress");
    return res.data;
  }

  // Meetings
  async getMeetings(pageNumber?: number, pageSize?: number): Promise<PagedResponse<HodMeeting>> {
    const qp = new URLSearchParams();
    if (pageNumber) qp.set("pageNumber", String(pageNumber));
    if (pageSize) qp.set("pageSize", String(pageSize ?? "20"));
    const qs = qp.toString();
    const res = await apiClient.get<PagedResponse<HodMeeting>>(`/meetings${qs ? `?${qs}` : ""}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get meetings");
    return res.data;
  }
  async getMeetingDetail(id: string): Promise<HodMeeting> {
    const res = await apiClient.get<HodMeeting>(`/meetings/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get meeting detail");
    return res.data;
  }
  async createMeeting(data: { title: string; description?: string; scheduledAt: string; durationMinutes: number; agenda?: string; meetingLink?: string; participantIds: string[] }): Promise<HodMeeting> {
    const res = await apiClient.post<HodMeeting>("/meetings", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create meeting");
    return res.data;
  }
  async updateMeeting(id: string, data: Partial<HodMeeting>): Promise<HodMeeting> {
    const res = await apiClient.put<HodMeeting>(`/meetings/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update meeting");
    return res.data;
  }
  async deleteMeeting(id: string): Promise<void> {
    const res = await apiClient.delete(`/meetings/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete meeting");
  }

  // Notifications
  async getNotifications(pageNumber?: number, pageSize?: number): Promise<PagedResponse<AppNotification>> {
    const qp = new URLSearchParams();
    if (pageNumber) qp.set("pageNumber", String(pageNumber));
    if (pageSize) qp.set("pageSize", String(pageSize ?? "20"));
    const qs = qp.toString();
    const res = await apiClient.get<PagedResponse<AppNotification>>(`/notifications${qs ? `?${qs}` : ""}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get notifications");
    return res.data;
  }
  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<number>("/notifications/unread-count");
    if (!res.success) throw new Error(res.message || "Failed to get unread count");
    return res.data;
  }
  async markNotificationRead(notificationIds: string[]): Promise<void> {
    const res = await apiClient.put("/notifications/mark-read", { notificationIds });
    if (!res.success) throw new Error(res.message || "Failed to mark as read");
  }
  async markAllNotificationsRead(): Promise<void> {
    const res = await apiClient.put("/notifications/mark-all-read");
    if (!res.success) throw new Error(res.message || "Failed to mark all as read");
  }
  async deleteNotification(id: string): Promise<void> {
    const res = await apiClient.delete(`/notifications/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete notification");
  }
}

export const hodService = new HodService();
