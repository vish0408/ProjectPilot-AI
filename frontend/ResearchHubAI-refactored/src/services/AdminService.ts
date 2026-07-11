import { apiClient } from "../api/client";
import type {
  CollegeResponse, CreateCollegeRequest, UpdateCollegeRequest,
  DepartmentResponse, CreateDepartmentRequest, UpdateDepartmentRequest,
  AcademicYearResponse, CreateAcademicYearRequest, UpdateAcademicYearRequest,
  SemesterResponse, CreateSemesterRequest, UpdateSemesterRequest,
  FacultyResponse, CreateFacultyRequest, UpdateFacultyRequest,
  UserResponse, CreateUserRequest, UpdateUserRequest,
  RoleResponse, CreateRoleRequest, UpdateRoleRequest,
  PermissionResponse, CreatePermissionRequest,
  AdminDashboardResponse,
  GlobalAnnouncementResponse, CreateGlobalAnnouncementRequest, UpdateGlobalAnnouncementRequest,
  AuditLogResponse,
  SystemSettingResponse, UpdateSystemSettingRequest,
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
    const res = await apiClient.get<CollegeResponse[]>("/admin/colleges");
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

  // Departments
  async getDepartments(): Promise<DepartmentResponse[]> {
    const res = await apiClient.get<DepartmentResponse[]>("/admin/departments");
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
    const res = await apiClient.get<UserResponse[]>("/admin/users");
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
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
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
    const res = await apiClient.get<AuditLogResponse[]>("/admin/audit-logs");
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
}

export const adminService = new AdminService();
