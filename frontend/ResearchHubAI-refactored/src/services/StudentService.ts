import { apiClient } from "../api/client";
import { StudentProfileDto, Project, TaskItem, Milestone, ProjectDocument, AppNotification, DashboardData } from "../types/Student";

export class StudentService {
  // Profile
  async getProfile(): Promise<StudentProfileDto> {
    const res = await apiClient.get<StudentProfileDto>("/student/profile");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get profile");
    return res.data;
  }
  async updateProfile(data: Partial<StudentProfileDto>): Promise<StudentProfileDto> {

    const res = await apiClient.put<StudentProfileDto>("/student/profile", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update profile");
    return res.data;
  }

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const res = await apiClient.get<DashboardData>("/dashboard/student");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get dashboard");
    return res.data;
  }

  // Projects
  async getMyProjects(): Promise<Project[]> {
    const res = await apiClient.get<Project[]>("/projects/my");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get projects");
    return res.data;
  }

  async getProject(id: string): Promise<Project> {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get project");
    return res.data;
  }

  async createProject(data: { title: string; description: string; targetEndDate?: string }): Promise<Project> {
    const res = await apiClient.post<Project>("/projects", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create project");
    return res.data;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const res = await apiClient.put<Project>(`/projects/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update project");
    return res.data;
  }

  async deleteProject(id: string): Promise<void> {
    const res = await apiClient.delete(`/projects/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete project");
  }

  async addProjectMember(projectId: string, userId: string, role: string): Promise<void> {
    const res = await apiClient.post(`/projects/${projectId}/members`, { userId, role });
    if (!res.success) throw new Error(res.message || "Failed to add member");
  }

  async removeProjectMember(projectId: string, memberId: string): Promise<void> {
    const res = await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
    if (!res.success) throw new Error(res.message || "Failed to remove member");
  }

  // Tasks
  async getTasks(projectId: string): Promise<TaskItem[]> {
    const res = await apiClient.get<TaskItem[]>(`/projects/${projectId}/tasks`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get tasks");
    return res.data;
  }

  async createTask(projectId: string, data: Partial<TaskItem>): Promise<TaskItem> {
    const res = await apiClient.post<TaskItem>(`/projects/${projectId}/tasks`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create task");
    return res.data;
  }

  async updateTask(projectId: string, taskId: string, data: Partial<TaskItem>): Promise<TaskItem> {
    const res = await apiClient.put<TaskItem>(`/projects/${projectId}/tasks/${taskId}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update task");
    return res.data;
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    const res = await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
    if (!res.success) throw new Error(res.message || "Failed to delete task");
  }

  // Milestones
  async getMilestones(projectId: string): Promise<Milestone[]> {
    const res = await apiClient.get<Milestone[]>(`/projects/${projectId}/milestones`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get milestones");
    return res.data;
  }

  async createMilestone(projectId: string, data: Partial<Milestone>): Promise<Milestone> {
    const res = await apiClient.post<Milestone>(`/projects/${projectId}/milestones`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create milestone");
    return res.data;
  }

  async updateMilestone(projectId: string, milestoneId: string, data: Partial<Milestone>): Promise<Milestone> {
    const res = await apiClient.put<Milestone>(`/projects/${projectId}/milestones/${milestoneId}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update milestone");
    return res.data;
  }

  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    const res = await apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`);
    if (!res.success) throw new Error(res.message || "Failed to delete milestone");
  }

  // Documents
  async getDocuments(projectId: string): Promise<ProjectDocument[]> {
    const res = await apiClient.get<ProjectDocument[]>(`/projects/${projectId}/documents`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get documents");
    return res.data;
  }

  async createDocument(projectId: string, data: Partial<ProjectDocument>): Promise<ProjectDocument> {
    const res = await apiClient.post<ProjectDocument>(`/projects/${projectId}/documents`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create document");
    return res.data;
  }

  async deleteDocument(projectId: string, documentId: string): Promise<void> {
    const res = await apiClient.delete(`/projects/${projectId}/documents/${documentId}`);
    if (!res.success) throw new Error(res.message || "Failed to delete document");
  }

  // Notifications
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

export const studentService = new StudentService();
