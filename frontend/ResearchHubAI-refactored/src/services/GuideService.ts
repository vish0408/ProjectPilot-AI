import { apiClient } from "../api/client";
import {
  GuideProfileDto,
  GuideDashboardData,
  Review,
  Chapter,
  ChapterComment,
  Meeting,
  ApprovalHistoryEntry,
} from "../types/Guide";

export class GuideService {
  // Profile
  async getProfile(): Promise<GuideProfileDto> {
    const res = await apiClient.get<GuideProfileDto>("/guide/profile");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get profile");
    return res.data;
  }
  async updateProfile(data: Partial<GuideProfileDto>): Promise<GuideProfileDto> {
    const res = await apiClient.put<GuideProfileDto>("/guide/profile", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update profile");
    return res.data;
  }

  // Dashboard
  async getDashboard(): Promise<GuideDashboardData> {
    const res = await apiClient.get<GuideDashboardData>("/dashboard/guide");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get dashboard");
    return res.data;
  }

  // Reviews
  async getMyReviews(): Promise<Review[]> {
    const res = await apiClient.get<Review[]>("/reviews/my");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get reviews");
    return res.data;
  }
  async getProjectReviews(projectId: string): Promise<Review[]> {
    const res = await apiClient.get<Review[]>(`/reviews/project/${projectId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get project reviews");
    return res.data;
  }
  async createReview(projectId: string, data: { status: string; notes: string }): Promise<Review> {
    const res = await apiClient.post<Review>(`/reviews/project/${projectId}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create review");
    return res.data;
  }

  // Chapters
  async getProjectChapters(projectId: string): Promise<Chapter[]> {
    const res = await apiClient.get<Chapter[]>(`/projects/${projectId}/chapters`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get chapters");
    return res.data;
  }
  async getChapter(chapterId: string): Promise<Chapter> {
    const res = await apiClient.get<Chapter>(`/chapters/${chapterId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get chapter");
    return res.data;
  }
  async updateChapterStatus(chapterId: string, data: { status: string; comment?: string }): Promise<Chapter> {
    const res = await apiClient.put<Chapter>(`/chapters/${chapterId}/status`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update chapter status");
    return res.data;
  }

  // Chapter Comments
  async getChapterComments(chapterId: string): Promise<ChapterComment[]> {
    const res = await apiClient.get<ChapterComment[]>(`/chapters/${chapterId}/comments`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get comments");
    return res.data;
  }
  async addChapterComment(chapterId: string, data: { content: string; lineNumber?: number }): Promise<ChapterComment> {
    const res = await apiClient.post<ChapterComment>(`/chapters/${chapterId}/comments`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to add comment");
    return res.data;
  }
  async deleteChapterComment(chapterId: string, commentId: string): Promise<void> {
    const res = await apiClient.delete(`/chapters/${chapterId}/comments/${commentId}`);
    if (!res.success) throw new Error(res.message || "Failed to delete comment");
  }

  // Meetings
  async getMyMeetings(): Promise<Meeting[]> {
    const res = await apiClient.get<Meeting[]>("/meetings");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get meetings");
    return res.data;
  }
  async getMeeting(id: string): Promise<Meeting> {
    const res = await apiClient.get<Meeting>(`/meetings/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get meeting");
    return res.data;
  }
  async createMeeting(data: {
    title: string;
    description?: string;
    scheduledAt: string;
    durationMinutes?: number;
    agenda?: string;
    meetingLink?: string;
    participantIds?: string[];
  }): Promise<Meeting> {
    const res = await apiClient.post<Meeting>("/meetings", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create meeting");
    return res.data;
  }
  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const res = await apiClient.put<Meeting>(`/meetings/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update meeting");
    return res.data;
  }
  async deleteMeeting(id: string): Promise<void> {
    const res = await apiClient.delete(`/meetings/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete meeting");
  }

  // Approval History
  async getProjectHistory(projectId: string): Promise<ApprovalHistoryEntry[]> {
    const res = await apiClient.get<ApprovalHistoryEntry[]>(`/approval-history/project/${projectId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get history");
    return res.data;
  }
  async getChapterHistory(chapterId: string): Promise<ApprovalHistoryEntry[]> {
    const res = await apiClient.get<ApprovalHistoryEntry[]>(`/approval-history/chapter/${chapterId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get chapter history");
    return res.data;
  }

  // Notifications (shared)
  async getNotifications(): Promise<AppNotification[]> {
    const res = await apiClient.get<AppNotification[]>("/notifications");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get notifications");
    return res.data;
  }
  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ count: number }>("/notifications/unread-count");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get unread count");
    return res.data.count;
  }
  async markNotificationsRead(ids: string[]): Promise<void> {
    const res = await apiClient.put("/notifications/mark-read", { notificationIds: ids });
    if (!res.success) throw new Error(res.message || "Failed to mark as read");
  }
  async markAllNotificationsRead(): Promise<void> {
    const res = await apiClient.put("/notifications/mark-all-read", {});
    if (!res.success) throw new Error(res.message || "Failed to mark all as read");
  }
}

export const guideService = new GuideService();
