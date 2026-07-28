import { apiClient } from "../api/client";
import type { PagedRequest, PagedResponse } from "../types/Pagination";
import type {
  CollegeResponse, CollegeAnalyticsResponse, CreateCollegeRequest, UpdateCollegeRequest,
  DepartmentResponse, CreateDepartmentRequest, UpdateDepartmentRequest,
  AcademicYearResponse, CreateAcademicYearRequest, UpdateAcademicYearRequest,
  SemesterResponse, CreateSemesterRequest, UpdateSemesterRequest,
  FacultyResponse, CreateFacultyRequest, UpdateFacultyRequest,
  UserResponse, CreateUserRequest, UpdateUserRequest,
  RoleResponse, CreateRoleRequest, UpdateRoleRequest,
  PermissionResponse, CreatePermissionRequest, UpdatePermissionRequest,
  AdminDashboardResponse,
  GlobalAnnouncementResponse, CreateGlobalAnnouncementRequest, UpdateGlobalAnnouncementRequest,
  AuditLogResponse,
  SystemSettingResponse, UpdateSystemSettingRequest,
  ResearchTopicResponse, CreateResearchTopicRequest, UpdateResearchTopicRequest,
  BackupRecordResponse,
  HodResponse, CreateHodRequest, UpdateHodRequest,
} from "../types/Admin";

export class AdminService {
  // Dashboard
  async getDashboard(): Promise<AdminDashboardResponse> {
    const res = await apiClient.get<AdminDashboardResponse>("/admin/dashboard");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get dashboard");
    return res.data;
  }

  // Colleges
  async getColleges(): Promise<CollegeResponse[]> {
    const res = await apiClient.get<CollegeResponse[]>("/admin/colleges/all");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get colleges");
    return Array.isArray(res.data) ? res.data : [];
  }

  async getCollegesPaged(request?: PagedRequest): Promise<PagedResponse<CollegeResponse>> {
    const params = new URLSearchParams();
    if (request?.pageNumber) params.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) params.set("pageSize", String(request.pageSize));
    if (request?.searchTerm) params.set("searchTerm", request.searchTerm);
    if (request?.sortField) params.set("sortField", request.sortField);
    if (request?.sortDirection) params.set("sortDirection", request.sortDirection);
    if (request?.statusFilter) params.set("statusFilter", request.statusFilter);
    const qs = params.toString();
    const res = await apiClient.get<PagedResponse<CollegeResponse>>(`/admin/colleges${qs ? `?${qs}` : ""}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get colleges");
    return res.data;
  }

  async getCollege(id: string): Promise<CollegeResponse> {
    const res = await apiClient.get<CollegeResponse>(`/admin/colleges/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get college");
    return res.data;
  }

  async createCollege(data: CreateCollegeRequest): Promise<CollegeResponse> {
    const res = await apiClient.post<CollegeResponse>("/admin/colleges", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create college");
    return res.data;
  }

  async updateCollege(id: string, data: UpdateCollegeRequest): Promise<CollegeResponse> {
    const res = await apiClient.put<CollegeResponse>(`/admin/colleges/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update college");
    return res.data;
  }

  async deleteCollege(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/colleges/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete college");
  }

  async getCollegeAnalytics(): Promise<CollegeAnalyticsResponse[]> {
    const res = await apiClient.get<CollegeAnalyticsResponse[]>("/admin/colleges/analytics");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get college analytics");
    return res.data;
  }

  // Departments
  async getDepartmentsPaged(request?: PagedRequest, collegeId?: string, signal?: AbortSignal): Promise<PagedResponse<DepartmentResponse>> {
    const params = new URLSearchParams();
    if (request?.pageNumber) params.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) params.set("pageSize", String(request.pageSize));
    if (request?.searchTerm) params.set("searchTerm", request.searchTerm);
    if (request?.sortField) params.set("sortField", request.sortField);
    if (request?.sortDirection) params.set("sortDirection", request.sortDirection);
    if (request?.statusFilter) params.set("statusFilter", request.statusFilter);
    if (collegeId) params.set("collegeId", collegeId);
    const qs = params.toString();
    const res = await apiClient.get<PagedResponse<DepartmentResponse>>(`/admin/departments${qs ? `?${qs}` : ""}`, signal);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getAllDepartments(collegeId?: string): Promise<DepartmentResponse[]> {
    const path = collegeId ? `/admin/departments/all?collegeId=${collegeId}` : "/admin/departments/all";
    const res = await apiClient.get<DepartmentResponse[]>(path);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getDepartment(id: string): Promise<DepartmentResponse> {
    const res = await apiClient.get<DepartmentResponse>(`/admin/departments/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<DepartmentResponse> {
    const res = await apiClient.post<DepartmentResponse>("/admin/departments", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<DepartmentResponse> {
    const res = await apiClient.put<DepartmentResponse>(`/admin/departments/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async deleteDepartment(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/departments/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Academic Years
  async getAcademicYears(): Promise<AcademicYearResponse[]> {
    const res = await apiClient.get<AcademicYearResponse[]>("/admin/academic-years");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getAcademicYear(id: string): Promise<AcademicYearResponse> {
    const res = await apiClient.get<AcademicYearResponse>(`/admin/academic-years/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createAcademicYear(data: CreateAcademicYearRequest): Promise<AcademicYearResponse> {
    const res = await apiClient.post<AcademicYearResponse>("/admin/academic-years", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateAcademicYear(id: string, data: UpdateAcademicYearRequest): Promise<AcademicYearResponse> {
    const res = await apiClient.put<AcademicYearResponse>(`/admin/academic-years/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
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
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getSemester(id: string): Promise<SemesterResponse> {
    const res = await apiClient.get<SemesterResponse>(`/admin/semesters/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getSemestersByAcademicYear(academicYearId: string): Promise<SemesterResponse[]> {
    const res = await apiClient.get<SemesterResponse[]>(`/admin/semesters/by-academic-year/${academicYearId}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createSemester(data: CreateSemesterRequest): Promise<SemesterResponse> {
    const res = await apiClient.post<SemesterResponse>("/admin/semesters", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateSemester(id: string, data: UpdateSemesterRequest): Promise<SemesterResponse> {
    const res = await apiClient.put<SemesterResponse>(`/admin/semesters/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
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
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getFaculty(id: string): Promise<FacultyResponse> {
    const res = await apiClient.get<FacultyResponse>(`/admin/faculties/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createFaculty(data: CreateFacultyRequest): Promise<FacultyResponse> {
    const res = await apiClient.post<FacultyResponse>("/admin/faculties", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateFaculty(id: string, data: UpdateFacultyRequest): Promise<FacultyResponse> {
    const res = await apiClient.put<FacultyResponse>(`/admin/faculties/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async deleteFaculty(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/faculties/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Users
  async getUsers(): Promise<UserResponse[]> {
    const res = await apiClient.get<UserResponse[]>("/admin/users/all");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return Array.isArray(res.data) ? res.data : [];
  }

  async getUsersPaged(request?: PagedRequest, signal?: AbortSignal): Promise<PagedResponse<UserResponse>> {
    const params = new URLSearchParams();
    if (request?.pageNumber) params.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) params.set("pageSize", String(request.pageSize));
    if (request?.searchTerm) params.set("searchTerm", request.searchTerm);
    if (request?.sortField) params.set("sortField", request.sortField);
    if (request?.sortDirection) params.set("sortDirection", request.sortDirection);
    if (request?.roleFilter) params.set("roleFilter", request.roleFilter);
    if (request?.statusFilter) params.set("statusFilter", request.statusFilter);
    if (request?.departmentFilter) params.set("departmentFilter", request.departmentFilter);
    if (request?.collegeFilter) params.set("collegeFilter", request.collegeFilter);
    const qs = params.toString();
    const res = await apiClient.get<PagedResponse<UserResponse>>(`/admin/users${qs ? `?${qs}` : ""}`, signal);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getUser(id: string): Promise<UserResponse> {
    const res = await apiClient.get<UserResponse>(`/admin/users/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const res = await apiClient.post<UserResponse>("/admin/users", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    const res = await apiClient.put<UserResponse>(`/admin/users/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async deleteUser(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/users/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Roles
  async getRoles(): Promise<RoleResponse[]> {
    const res = await apiClient.get<RoleResponse[]>("/admin/roles");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getRole(id: string): Promise<RoleResponse> {
    const res = await apiClient.get<RoleResponse>(`/admin/roles/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createRole(data: CreateRoleRequest): Promise<RoleResponse> {
    const res = await apiClient.post<RoleResponse>("/admin/roles", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<RoleResponse> {
    const res = await apiClient.put<RoleResponse>(`/admin/roles/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async deleteRole(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/roles/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }

  // Permissions
  async getPermissions(): Promise<PermissionResponse[]> {
    const res = await apiClient.get<PermissionResponse[]>("/admin/permissions");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getPermission(id: string): Promise<PermissionResponse> {
    const res = await apiClient.get<PermissionResponse>(`/admin/permissions/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createPermission(data: CreatePermissionRequest): Promise<PermissionResponse> {
    const res = await apiClient.post<PermissionResponse>("/admin/permissions", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create permission");
    return res.data;
  }

  async updatePermission(id: string, data: UpdatePermissionRequest): Promise<PermissionResponse> {
    const res = await apiClient.put<PermissionResponse>(`/admin/permissions/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update permission");
    return res.data;
  }

  async deletePermission(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/permissions/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete permission");
  }

  // Announcements
  async getAnnouncements(): Promise<GlobalAnnouncementResponse[]> {
    const res = await apiClient.get<GlobalAnnouncementResponse[]>("/admin/announcements");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getAnnouncement(id: string): Promise<GlobalAnnouncementResponse> {
    const res = await apiClient.get<GlobalAnnouncementResponse>(`/admin/announcements/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createAnnouncement(data: CreateGlobalAnnouncementRequest): Promise<GlobalAnnouncementResponse> {
    const res = await apiClient.post<GlobalAnnouncementResponse>("/admin/announcements", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateAnnouncement(id: string, data: UpdateGlobalAnnouncementRequest): Promise<GlobalAnnouncementResponse> {
    const res = await apiClient.put<GlobalAnnouncementResponse>(`/admin/announcements/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
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
  async getAuditLogs(): Promise<AuditLogResponse[]> {
    const res = await apiClient.get<AuditLogResponse[]>("/admin/audit-logs/all");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return Array.isArray(res.data) ? res.data : [];
  }

  async getAuditLogsPaged(request?: PagedRequest, signal?: AbortSignal): Promise<PagedResponse<AuditLogResponse>> {
    const params = new URLSearchParams();
    if (request?.pageNumber) params.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) params.set("pageSize", String(request.pageSize));
    if (request?.searchTerm) params.set("searchTerm", request.searchTerm);
    if (request?.statusFilter) params.set("statusFilter", request.statusFilter);
    const qs = params.toString();
    const res = await apiClient.get<PagedResponse<AuditLogResponse>>(`/admin/audit-logs${qs ? `?${qs}` : ""}`, signal);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getAuditLog(id: string): Promise<AuditLogResponse> {
    const res = await apiClient.get<AuditLogResponse>(`/admin/audit-logs/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  // Settings
  async getSettings(): Promise<SystemSettingResponse[]> {
    const res = await apiClient.get<SystemSettingResponse[]>("/admin/settings");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getSetting(id: string): Promise<SystemSettingResponse> {
    const res = await apiClient.get<SystemSettingResponse>(`/admin/settings/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getSettingByKey(key: string): Promise<SystemSettingResponse> {
    const res = await apiClient.get<SystemSettingResponse>(`/admin/settings/by-key/${key}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateSetting(id: string, data: UpdateSystemSettingRequest): Promise<SystemSettingResponse> {
    const res = await apiClient.put<SystemSettingResponse>(`/admin/settings/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  // Research Topics
  async getResearchCategories(): Promise<import("../types/Hod").ResearchCategory[]> {
    const res = await apiClient.get<import("../types/Hod").ResearchCategory[]>("/hod/research-categories");
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get research categories");
    return res.data;
  }

  async getResearchTopics(categoryId?: string): Promise<ResearchTopicResponse[]> {
    const path = categoryId ? `/hod/research-topics?categoryId=${categoryId}` : "/hod/research-topics";
    const res = await apiClient.get<ResearchTopicResponse[]>(path);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get research topics");
    return res.data;
  }

  async createResearchTopic(data: CreateResearchTopicRequest): Promise<ResearchTopicResponse> {
    const res = await apiClient.post<ResearchTopicResponse>("/hod/research-topics", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create research topic");
    return res.data;
  }

  async updateResearchTopic(id: string, data: UpdateResearchTopicRequest): Promise<ResearchTopicResponse> {
    const res = await apiClient.put<ResearchTopicResponse>(`/hod/research-topics/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to update research topic");
    return res.data;
  }

  async deleteResearchTopic(id: string): Promise<void> {
    const res = await apiClient.delete(`/hod/research-topics/${id}`);
    if (!res.success) throw new Error(res.message || "Failed to delete research topic");
  }

  // Backup (stub - no backend implementation)
  async getBackupHistory(): Promise<BackupRecordResponse[]> {
    return [];
  }

  async createBackup(): Promise<void> {
    throw new Error("Backup feature is not implemented in this version");
  }

  async deleteBackup(id: string): Promise<void> {
    throw new Error("Backup feature is not implemented in this version");
  }

  // Resend Invitation
  async resendInvitation(userId: string): Promise<void> {
    const res = await apiClient.post(`/admin/users/${userId}/resend-invitation`);
    if (!res.success) throw new Error(res.message || "Failed to resend invitation");
  }

  // Send Invitation (new endpoint)
  async sendInvitation(userId: string): Promise<void> {
    const res = await apiClient.post(`/admin/users/${userId}/send-invitation`);
    if (!res.success) throw new Error(res.message || "Failed to send invitation");
  }

  // HOD Management
  async getHodsPaged(request?: PagedRequest, collegeId?: string, departmentId?: string, signal?: AbortSignal): Promise<PagedResponse<HodResponse>> {
    const params = new URLSearchParams();
    if (request?.pageNumber) params.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) params.set("pageSize", String(request.pageSize));
    if (request?.searchTerm) params.set("searchTerm", request.searchTerm);
    if (request?.sortField) params.set("sortField", request.sortField);
    if (request?.sortDirection) params.set("sortDirection", request.sortDirection);
    if (request?.statusFilter) params.set("statusFilter", request.statusFilter);
    if (collegeId) params.set("collegeId", collegeId);
    if (departmentId) params.set("departmentId", departmentId);
    const qs = params.toString();
    const res = await apiClient.get<PagedResponse<HodResponse>>(`/admin/hods${qs ? `?${qs}` : ""}`, signal);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getAllHods(collegeId?: string, departmentId?: string): Promise<HodResponse[]> {
    const params = new URLSearchParams();
    if (collegeId) params.set("collegeId", collegeId);
    if (departmentId) params.set("departmentId", departmentId);
    const qs = params.toString();
    const res = await apiClient.get<HodResponse[]>(`/admin/hods/all${qs ? `?${qs}` : ""}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getHod(id: string): Promise<HodResponse> {
    const res = await apiClient.get<HodResponse>(`/admin/hods/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async createHod(data: CreateHodRequest): Promise<HodResponse> {
    const res = await apiClient.post<HodResponse>("/admin/hods", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async updateHod(id: string, data: UpdateHodRequest): Promise<HodResponse> {
    const res = await apiClient.put<HodResponse>(`/admin/hods/${id}`, data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async deleteHod(id: string): Promise<void> {
    const res = await apiClient.delete(`/admin/hods/${id}`);
    if (!res.success) throw new Error(res.message || "Failed");
  }
}

export const adminService = new AdminService();
