import { apiClient } from "../api/client";
import type { PagedRequest, PagedResponse } from "../types/Pagination";
import {
  GuideProfileDto,
  GuideDashboardData,
  Review,
  Chapter,
  ChapterComment,
  Meeting,
  ApprovalHistoryEntry,
  ThesisDocumentSummary,
  DocumentComment,
  AppNotification,
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
    const res = await apiClient.get<PagedResponse<Review>>("/reviews/my");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get reviews");
    return res.data.items;
  }
  async getProjectReviews(projectId: string): Promise<Review[]> {
    const res = await apiClient.get<PagedResponse<Review>>(`/reviews/project/${projectId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get project reviews");
    return res.data.items;
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
  async getChapter(projectId: string, chapterId: string): Promise<Chapter> {
    const res = await apiClient.get<Chapter>(`/projects/${projectId}/chapters/${chapterId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get chapter");
    return res.data;
  }
  async updateChapterStatus(projectId: string, chapterId: string, data: { status: string; comment?: string }): Promise<Chapter> {
    const res = await apiClient.put<Chapter>(`/projects/${projectId}/chapters/${chapterId}/status`, data);
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
  async getMyMeetings(request?: PagedRequest): Promise<PagedResponse<Meeting>> {
    const qp = new URLSearchParams();
    if (request?.pageNumber) qp.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) qp.set("pageSize", String(request.pageSize));
    const qs = qp.toString();
    const res = await apiClient.get<PagedResponse<Meeting>>(`/meetings${qs ? `?${qs}` : ""}`);
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

  // Thesis Reviews
  async getThesisReviews(): Promise<ThesisDocumentSummary[]> {
    const res = await apiClient.get<ThesisDocumentSummary[]>("/guide/thesis-reviews");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get thesis reviews");
    return res.data;
  }
  async getStudentDocuments(studentId: string): Promise<ThesisDocumentSummary[]> {
    const res = await apiClient.get<ThesisDocumentSummary[]>(`/guide/thesis-reviews/student/${studentId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get student documents");
    return res.data;
  }
  async reviewDocument(documentId: string, data: { status: string; comment?: string; score?: number }): Promise<void> {
    const res = await apiClient.post(`/guide/thesis-reviews/${documentId}/review`, data);
    if (!res.success) throw new Error(res.message || "Failed to submit review");
  }
  async getDocumentVersions(projectId: string, documentId: string): Promise<ThesisDocumentSummary[]> {
    const res = await apiClient.get<ThesisDocumentSummary[]>(`/guide/thesis-reviews/project/${projectId}/versions/${documentId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get document versions");
    return res.data;
  }

  // Document Comments
  async getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    const res = await apiClient.get<DocumentComment[]>(`/documents/${documentId}/comments`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get comments");
    return res.data;
  }
  async addDocumentComment(documentId: string, data: { content: string; parentCommentId?: string }): Promise<DocumentComment> {
    const res = await apiClient.post<DocumentComment>(`/documents/${documentId}/comments`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to add comment");
    return res.data;
  }
  async updateDocumentComment(documentId: string, commentId: string, content: string): Promise<DocumentComment> {
    const res = await apiClient.put<DocumentComment>(`/documents/${documentId}/comments/${commentId}`, content);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update comment");
    return res.data;
  }
  async deleteDocumentComment(documentId: string, commentId: string): Promise<void> {
    const res = await apiClient.delete(`/documents/${documentId}/comments/${commentId}`);
    if (!res.success) throw new Error(res.message || "Failed to delete comment");
  }

  // Document File - Authenticated Blob Fetch
  private async fetchDocumentBlobInternal(path: string): Promise<Blob> {
    const token = localStorage.getItem("accessToken");
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";
    const response = await fetch(`${baseUrl}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`Failed to fetch document: ${response.status}`);
    return response.blob();
  }

  async fetchDocumentBlob(projectId: string, documentId: string, mode: "download" | "preview" = "preview"): Promise<{ blob: Blob; url: string; contentType: string }> {
    const path = `/projects/${projectId}/documents/${documentId}/${mode}`;
    const blob = await this.fetchDocumentBlobInternal(path);
    const url = URL.createObjectURL(blob);
    return { blob, url, contentType: blob.type };
  }

  async downloadDocument(projectId: string, documentId: string, fileName: string): Promise<void> {
    const { blob } = await this.fetchDocumentBlob(projectId, documentId, "download");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  async fetchDocumentText(projectId: string, documentId: string): Promise<string> {
    const path = `/projects/${projectId}/documents/${documentId}/preview`;
    const token = localStorage.getItem("accessToken");
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";
    const response = await fetch(`${baseUrl}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`Failed to fetch document: ${response.status}`);
    return response.text();
  }

  getDocumentDownloadUrl(projectId: string, documentId: string): string {
    return `/api/projects/${projectId}/documents/${documentId}/download`;
  }
  getDocumentPreviewUrl(projectId: string, documentId: string): string {
    return `/api/projects/${projectId}/documents/${documentId}/preview`;
  }
  getDocumentUploadUrl(projectId: string): string {
    return `/api/projects/${projectId}/documents/upload`;
  }

  // Notifications (shared)
  async getNotifications(request?: PagedRequest): Promise<PagedResponse<AppNotification>> {
    const qp = new URLSearchParams();
    if (request?.pageNumber) qp.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) qp.set("pageSize", String(request.pageSize));
    const qs = qp.toString();
    const res = await apiClient.get<PagedResponse<AppNotification>>(`/notifications${qs ? `?${qs}` : ""}`);
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
