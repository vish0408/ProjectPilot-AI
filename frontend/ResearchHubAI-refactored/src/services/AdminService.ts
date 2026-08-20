import { apiClient } from "../api/client";
import type { PagedRequest, PagedResponse } from "../types/Pagination";
import type { ResearchCategory } from "../types/Hod";
import type {
  CollegeResponse, CreateCollegeRequest, UpdateCollegeRequest, CollegeAnalyticsResponse,
  DepartmentResponse, CreateDepartmentRequest, UpdateDepartmentRequest,
  AcademicYearResponse, CreateAcademicYearRequest, UpdateAcademicYearRequest,
  SemesterResponse, CreateSemesterRequest, UpdateSemesterRequest,
  FacultyResponse, CreateFacultyRequest, UpdateFacultyRequest,
  UserResponse, CreateUserRequest, UpdateUserRequest,
  HodResponse, CreateHodRequest, UpdateHodRequest,
  RoleResponse, CreateRoleRequest, UpdateRoleRequest,
  PermissionResponse, CreatePermissionRequest, UpdatePermissionRequest,
  ResearchStageResponse, CreateResearchStageRequest, UpdateResearchStageRequest,
  ResearchTopicResponse, CreateResearchTopicRequest, UpdateResearchTopicRequest,
  ResearchCategoryResponse, CreateResearchCategoryRequest, UpdateResearchCategoryRequest,
  AdminDashboardResponse,
  GlobalAnnouncementResponse, CreateGlobalAnnouncementRequest, UpdateGlobalAnnouncementRequest,
  AuditLogResponse,
  SystemSettingResponse, UpdateSystemSettingRequest,
  CourseworkResponse, CourseworkSummaryResponse, CreateCourseworkRequest, UpdateCourseworkRequest,
} from "../types/Admin";

function unwrap<T>(res: { success: boolean; data?: T | null; message?: string }, fallbackMsg: string): T {
  if (!res.success || res.data === undefined || res.data === null) {
    throw new Error(res.message || fallbackMsg);
  }
  return res.data;
}

export class AdminService {
  // Dashboard
  async getDashboard(): Promise<AdminDashboardResponse> {
    const res = await apiClient.get<AdminDashboardResponse>("/admin/dashboard");
    return unwrap(res, "Failed to get dashboard");
  }

  // Colleges
  async getAllColleges(): Promise<CollegeResponse[]> {
    const res = await apiClient.get<CollegeResponse[]>("/admin/colleges/all");
    return unwrap(res, "Failed to get colleges");
  }

  async getColleges(): Promise<CollegeResponse[]> {
    return this.getAllColleges();
  }

  async getCollegesPaged(req: PagedRequest = {}, signal?: AbortSignal): Promise<PagedResponse<CollegeResponse>> {
    const res = await apiClient.get<PagedResponse<CollegeResponse>>("/admin/colleges", { params: req, signal });
    return unwrap(res, "Failed to get colleges");
  }

  async getCollegeAnalytics(): Promise<CollegeAnalyticsResponse[]> {
    const res = await apiClient.get<CollegeAnalyticsResponse[]>("/admin/colleges/analytics");
    return unwrap(res, "Failed to get college analytics");
  }

  async getCollege(id: string): Promise<CollegeResponse> {
    const res = await apiClient.get<CollegeResponse>(`/admin/colleges/${id}`);
    return unwrap(res, "Failed to get college");
  }

  async createCollege(data: CreateCollegeRequest): Promise<CollegeResponse> {
    const res = await apiClient.post<CollegeResponse>("/admin/colleges", data);
    return unwrap(res, "Failed to create college");
  }

  async updateCollege(id: string, data: UpdateCollegeRequest): Promise<CollegeResponse> {
    const res = await apiClient.put<CollegeResponse>(`/admin/colleges/${id}`, data);
    return unwrap(res, "Failed to update college");
  }

  async deleteCollege(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/colleges/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete college");
  }

  // Departments
  async getAllDepartments(collegeId?: string): Promise<DepartmentResponse[]> {
    const res = await apiClient.get<DepartmentResponse[]>("/admin/departments/all", {
      params: collegeId ? { collegeId } : undefined,
    });
    return unwrap(res, "Failed to get departments");
  }

  async getDepartments(): Promise<DepartmentResponse[]> {
    return this.getAllDepartments();
  }

  async getDepartmentsPaged(req: PagedRequest = {}, signal?: AbortSignal): Promise<PagedResponse<DepartmentResponse>> {
    const res = await apiClient.get<PagedResponse<DepartmentResponse>>("/admin/departments", { params: req, signal });
    return unwrap(res, "Failed to get departments");
  }

  async getDepartment(id: string): Promise<DepartmentResponse> {
    const res = await apiClient.get<DepartmentResponse>(`/admin/departments/${id}`);
    return unwrap(res, "Failed to get department");
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<DepartmentResponse> {
    const res = await apiClient.post<DepartmentResponse>("/admin/departments", data);
    return unwrap(res, "Failed to create department");
  }

  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<DepartmentResponse> {
    const res = await apiClient.put<DepartmentResponse>(`/admin/departments/${id}`, data);
    return unwrap(res, "Failed to update department");
  }

  async deleteDepartment(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/departments/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete department");
  }

  // Academic Years
  async getAcademicYears(): Promise<AcademicYearResponse[]> {
    const res = await apiClient.get<AcademicYearResponse[]>("/admin/academic-years");
    return unwrap(res, "Failed to get academic years");
  }

  async getAcademicYear(id: string): Promise<AcademicYearResponse> {
    const res = await apiClient.get<AcademicYearResponse>(`/admin/academic-years/${id}`);
    return unwrap(res, "Failed");
  }

  async createAcademicYear(data: CreateAcademicYearRequest): Promise<AcademicYearResponse> {
    const res = await apiClient.post<AcademicYearResponse>("/admin/academic-years", data);
    return unwrap(res, "Failed");
  }

  async updateAcademicYear(id: string, data: UpdateAcademicYearRequest): Promise<AcademicYearResponse> {
    const res = await apiClient.put<AcademicYearResponse>(`/admin/academic-years/${id}`, data);
    return unwrap(res, "Failed");
  }

  async deleteAcademicYear(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/academic-years/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  async setCurrentAcademicYear(id: string): Promise<void> {
    const res = await apiClient.put(`/admin/academic-years/${id}/set-current`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Semesters
  async getSemesters(): Promise<SemesterResponse[]> {
    const res = await apiClient.get<SemesterResponse[]>("/admin/semesters");
    return unwrap(res, "Failed");
  }

  async getSemester(id: string): Promise<SemesterResponse> {
    const res = await apiClient.get<SemesterResponse>(`/admin/semesters/${id}`);
    return unwrap(res, "Failed");
  }

  async getSemestersByAcademicYear(academicYearId: string): Promise<SemesterResponse[]> {
    const res = await apiClient.get<SemesterResponse[]>(`/admin/semesters/by-academic-year/${academicYearId}`);
    return unwrap(res, "Failed");
  }

  async createSemester(data: CreateSemesterRequest): Promise<SemesterResponse> {
    const res = await apiClient.post<SemesterResponse>("/admin/semesters", data);
    return unwrap(res, "Failed");
  }

  async updateSemester(id: string, data: UpdateSemesterRequest): Promise<SemesterResponse> {
    const res = await apiClient.put<SemesterResponse>(`/admin/semesters/${id}`, data);
    return unwrap(res, "Failed");
  }

  async deleteSemester(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/semesters/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  async setCurrentSemester(id: string): Promise<void> {
    const res = await apiClient.put(`/admin/semesters/${id}/set-current`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Faculties
  async getFaculties(): Promise<FacultyResponse[]> {
    const res = await apiClient.get<FacultyResponse[]>("/admin/faculties");
    return unwrap(res, "Failed");
  }

  async getFaculty(id: string): Promise<FacultyResponse> {
    const res = await apiClient.get<FacultyResponse>(`/admin/faculties/${id}`);
    return unwrap(res, "Failed");
  }

  async createFaculty(data: CreateFacultyRequest): Promise<FacultyResponse> {
    const res = await apiClient.post<FacultyResponse>("/admin/faculties", data);
    return unwrap(res, "Failed");
  }

  async updateFaculty(id: string, data: UpdateFacultyRequest): Promise<FacultyResponse> {
    const res = await apiClient.put<FacultyResponse>(`/admin/faculties/${id}`, data);
    return unwrap(res, "Failed");
  }

  async deleteFaculty(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/faculties/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Users
  async getUsersPaged(req: PagedRequest = {}, signal?: AbortSignal): Promise<PagedResponse<UserResponse>> {
    const res = await apiClient.get<PagedResponse<UserResponse>>("/admin/users", { params: req, signal });
    return unwrap(res, "Failed to get users");
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const res = await apiClient.get<UserResponse[]>("/admin/users/all");
    return unwrap(res, "Failed to get users");
  }

  async getUsers(): Promise<UserResponse[]> {
    return this.getAllUsers();
  }

  async getUser(id: string): Promise<UserResponse> {
    const res = await apiClient.get<UserResponse>(`/admin/users/${id}`);
    return unwrap(res, "Failed to get user");
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const res = await apiClient.post<UserResponse>("/admin/users", data);
    return unwrap(res, "Failed to create user");
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    const res = await apiClient.put<UserResponse>(`/admin/users/${id}`, data);
    return unwrap(res, "Failed to update user");
  }

  async deleteUser(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/users/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete user");
  }

  async sendInvitation(id: string): Promise<void> {
    const res = await apiClient.post(`/admin/users/${id}/send-invitation`);
    if (!res.success) throw new Error(res.message || "Failed to send invitation");
  }

  async resendInvitation(id: string): Promise<void> {
    const res = await apiClient.post(`/admin/users/${id}/resend-invitation`);
    if (!res.success) throw new Error(res.message || "Failed to resend invitation");
  }

  // HODs
  async getHodsPaged(req: PagedRequest = {}, collegeId?: string, departmentId?: string, signal?: AbortSignal): Promise<PagedResponse<HodResponse>> {
    const res = await apiClient.get<PagedResponse<HodResponse>>("/admin/hods", {
      params: { ...req, collegeId: collegeId || undefined, departmentId: departmentId || undefined },
      signal,
    });
    return unwrap(res, "Failed to get HODs");
  }

  async getAllHods(collegeId?: string, departmentId?: string): Promise<HodResponse[]> {
    const res = await apiClient.get<HodResponse[]>("/admin/hods/all", {
      params: { collegeId: collegeId || undefined, departmentId: departmentId || undefined },
    });
    return unwrap(res, "Failed to get HODs");
  }

  async createHod(data: CreateHodRequest): Promise<HodResponse> {
    const res = await apiClient.post<HodResponse>("/admin/hods", data);
    return unwrap(res, "Failed to create HOD");
  }

  async updateHod(id: string, data: UpdateHodRequest): Promise<HodResponse> {
    const res = await apiClient.put<HodResponse>(`/admin/hods/${id}`, data);
    return unwrap(res, "Failed to update HOD");
  }

  async deleteHod(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/hods/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete HOD");
  }

  // Roles
  async getRoles(): Promise<RoleResponse[]> {
    const res = await apiClient.get<RoleResponse[]>("/admin/roles");
    return unwrap(res, "Failed to get roles");
  }

  async getRole(id: string): Promise<RoleResponse> {
    const res = await apiClient.get<RoleResponse>(`/admin/roles/${id}`);
    return unwrap(res, "Failed");
  }

  async createRole(data: CreateRoleRequest): Promise<RoleResponse> {
    const res = await apiClient.post<RoleResponse>("/admin/roles", data);
    return unwrap(res, "Failed");
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<RoleResponse> {
    const res = await apiClient.put<RoleResponse>(`/admin/roles/${id}`, data);
    return unwrap(res, "Failed");
  }

  async deleteRole(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/roles/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Permissions
  async getPermissions(): Promise<PermissionResponse[]> {
    const res = await apiClient.get<PermissionResponse[]>("/admin/permissions");
    return unwrap(res, "Failed");
  }

  async getPermission(id: string): Promise<PermissionResponse> {
    const res = await apiClient.get<PermissionResponse>(`/admin/permissions/${id}`);
    return unwrap(res, "Failed");
  }

  async createPermission(data: CreatePermissionRequest): Promise<PermissionResponse> {
    const res = await apiClient.post<PermissionResponse>("/admin/permissions", data);
    return unwrap(res, "Failed");
  }

  async updatePermission(id: string, data: UpdatePermissionRequest): Promise<PermissionResponse> {
    const res = await apiClient.put<PermissionResponse>(`/admin/permissions/${id}`, data);
    return unwrap(res, "Failed");
  }

  async deletePermission(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/permissions/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Announcements
  async getAnnouncements(): Promise<GlobalAnnouncementResponse[]> {
    const res = await apiClient.get<GlobalAnnouncementResponse[]>("/admin/announcements");
    return unwrap(res, "Failed");
  }

  async getAnnouncement(id: string): Promise<GlobalAnnouncementResponse> {
    const res = await apiClient.get<GlobalAnnouncementResponse>(`/admin/announcements/${id}`);
    return unwrap(res, "Failed");
  }

  async createAnnouncement(data: CreateGlobalAnnouncementRequest): Promise<GlobalAnnouncementResponse> {
    const res = await apiClient.post<GlobalAnnouncementResponse>("/admin/announcements", data);
    return unwrap(res, "Failed");
  }

  async updateAnnouncement(id: string, data: UpdateGlobalAnnouncementRequest): Promise<GlobalAnnouncementResponse> {
    const res = await apiClient.put<GlobalAnnouncementResponse>(`/admin/announcements/${id}`, data);
    return unwrap(res, "Failed");
  }

  async publishAnnouncement(id: string): Promise<void> {
    const res = await apiClient.put(`/admin/announcements/${id}/publish`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/announcements/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Audit Logs
  async getAllAuditLogs(): Promise<AuditLogResponse[]> {
    const res = await apiClient.get<AuditLogResponse[]>("/admin/audit-logs/all");
    return unwrap(res, "Failed to get audit logs");
  }

  async getAuditLogs(): Promise<AuditLogResponse[]> {
    return this.getAllAuditLogs();
  }

  async getAuditLogsPaged(req: PagedRequest = {}, signal?: AbortSignal): Promise<PagedResponse<AuditLogResponse>> {
    const res = await apiClient.get<PagedResponse<AuditLogResponse>>("/admin/audit-logs", { params: req, signal });
    return unwrap(res, "Failed to get audit logs");
  }

  async getAuditLog(id: string): Promise<AuditLogResponse> {
    const res = await apiClient.get<AuditLogResponse>(`/admin/audit-logs/${id}`);
    return unwrap(res, "Failed to get audit log");
  }

  // Settings
  async getSettings(): Promise<SystemSettingResponse[]> {
    const res = await apiClient.get<SystemSettingResponse[]>("/admin/settings");
    return unwrap(res, "Failed to get settings");
  }

  async getSetting(id: string): Promise<SystemSettingResponse> {
    const res = await apiClient.get<SystemSettingResponse>(`/admin/settings/${id}`);
    return unwrap(res, "Failed");
  }

  async getSettingByKey(key: string): Promise<SystemSettingResponse> {
    const res = await apiClient.get<SystemSettingResponse>(`/admin/settings/by-key/${key}`);
    return unwrap(res, "Failed");
  }

  async updateSetting(id: string, data: UpdateSystemSettingRequest): Promise<SystemSettingResponse> {
    const res = await apiClient.put<SystemSettingResponse>(`/admin/settings/${id}`, data);
    return unwrap(res, "Failed");
  }

  // Research Stages
  async getResearchStages(): Promise<ResearchStageResponse[]> {
    const res = await apiClient.get<ResearchStageResponse[]>("/admin/research-stages");
    return unwrap(res, "Failed to get research stages");
  }

  async createResearchStage(data: CreateResearchStageRequest): Promise<ResearchStageResponse> {
    const res = await apiClient.post<ResearchStageResponse>("/admin/research-stages", data);
    return unwrap(res, "Failed to create research stage");
  }

  async updateResearchStage(id: string, data: UpdateResearchStageRequest): Promise<ResearchStageResponse> {
    const res = await apiClient.put<ResearchStageResponse>(`/admin/research-stages/${id}`, data);
    return unwrap(res, "Failed to update research stage");
  }

  async deleteResearchStage(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/research-stages/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete research stage");
  }

  // Research Categories (shared with HOD workspace)
  async getResearchCategories(): Promise<ResearchCategory[]> {
    const res = await apiClient.get<ResearchCategory[]>("/hod/research-categories");
    return unwrap(res, "Failed to get research categories");
  }

  async createResearchCategory(data: CreateResearchCategoryRequest): Promise<ResearchCategoryResponse> {
    const res = await apiClient.post<ResearchCategoryResponse>("/hod/research-categories", data);
    return unwrap(res, "Failed to create research category");
  }

  async updateResearchCategory(id: string, data: UpdateResearchCategoryRequest): Promise<ResearchCategoryResponse> {
    const res = await apiClient.put<ResearchCategoryResponse>(`/hod/research-categories/${id}`, data);
    return unwrap(res, "Failed to update research category");
  }

  // Research Topics
  async getResearchTopics(categoryId?: string, search?: string, departmentId?: string): Promise<ResearchTopicResponse[]> {
    const res = await apiClient.get<ResearchTopicResponse[]>("/hod/research-topics", {
      params: { categoryId: categoryId || undefined, search: search || undefined, departmentId: departmentId || undefined },
    });
    return unwrap(res, "Failed to get research topics");
  }

  async createResearchTopic(data: CreateResearchTopicRequest): Promise<ResearchTopicResponse> {
    const res = await apiClient.post<ResearchTopicResponse>("/hod/research-topics", data);
    return unwrap(res, "Failed to create research topic");
  }

  async updateResearchTopic(id: string, data: UpdateResearchTopicRequest): Promise<ResearchTopicResponse> {
    const res = await apiClient.put<ResearchTopicResponse>(`/hod/research-topics/${id}`, data);
    return unwrap(res, "Failed to update research topic");
  }

  async deleteResearchTopic(id: string): Promise<void> {
    const res = await apiClient.delete(`/hod/research-topics/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete research topic");
  }

  // Coursework
  async getCoursework(studentUserId: string): Promise<CourseworkResponse[]> {
    const res = await apiClient.get<CourseworkResponse[]>(`/students/${studentUserId}/coursework`);
    return unwrap(res, "Failed to get coursework");
  }

  async getCourseworkSummary(studentUserId: string): Promise<CourseworkSummaryResponse> {
    const res = await apiClient.get<CourseworkSummaryResponse>(`/students/${studentUserId}/coursework/summary`);
    return unwrap(res, "Failed to get coursework summary");
  }

  async createCoursework(studentUserId: string, data: CreateCourseworkRequest): Promise<CourseworkResponse> {
    const res = await apiClient.post<CourseworkResponse>(`/students/${studentUserId}/coursework`, data);
    return unwrap(res, "Failed to create coursework");
  }

  async updateCoursework(studentUserId: string, courseworkId: string, data: UpdateCourseworkRequest): Promise<CourseworkResponse> {
    const res = await apiClient.put<CourseworkResponse>(`/students/${studentUserId}/coursework/${courseworkId}`, data);
    return unwrap(res, "Failed to update coursework");
  }

  async deleteCoursework(studentUserId: string, courseworkId: string): Promise<void> {
    const res = await apiClient.delete(`/students/${studentUserId}/coursework/${courseworkId}`);
    if (!res.success) throw new Error(res.message || "Failed to delete coursework");
  }
}

export const adminService = new AdminService();