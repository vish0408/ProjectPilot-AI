import { apiClient } from "../api/client";
import {
  HodProfileDto,
  HodDashboardData,
  HodStudentSummary,
  HodGuideSummary,
  ProjectAllocation,
  ResearchCategory,
  ResearchTopic,
  DepartmentAnnouncement,
  DepartmentReport,
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
  async getStudents(search?: string): Promise<HodStudentSummary[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await apiClient.get<HodStudentSummary[]>(`/hod/students${params}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get students");
    return res.data;
  }

  // Guides
  async getGuides(): Promise<HodGuideSummary[]> {
    const res = await apiClient.get<HodGuideSummary[]>("/hod/guides");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get guides");
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
  async createAnnouncement(data: { title: string; content: string; priority?: string; scheduledAt?: string; expiresAt?: string }): Promise<DepartmentAnnouncement> {
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
    const res = await apiClient.post(`/hod/announcements/${id}/publish`, {});
    if (!res.success) throw new Error(res.message || "Failed to publish announcement");
  }
  async expireAnnouncement(id: string): Promise<void> {
    const res = await apiClient.post(`/hod/announcements/${id}/expire`, {});
    if (!res.success) throw new Error(res.message || "Failed to expire announcement");
  }

  // Reports
  async getReports(): Promise<DepartmentReport[]> {
    const res = await apiClient.get<DepartmentReport[]>("/hod/reports");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get reports");
    return res.data;
  }
  async generateReport(reportType: string, title: string): Promise<DepartmentReport> {
    const res = await apiClient.post<DepartmentReport>(`/hod/reports/generate?reportType=${reportType}&title=${encodeURIComponent(title)}`, {});
    if (!res.success || !res.data) throw new Error(res.message || "Failed to generate report");
    return res.data;
  }
}

export const hodService = new HodService();
