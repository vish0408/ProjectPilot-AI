export interface CollegeResponse {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
  departmentCount: number;
  createdAt: string;
}

export interface CreateCollegeRequest {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface UpdateCollegeRequest extends CreateCollegeRequest {
  isActive: boolean;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  collegeId: string;
  collegeName: string;
  isActive: boolean;
  facultyCount: number;
  createdAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description: string;
  collegeId: string;
}

export interface UpdateDepartmentRequest extends CreateDepartmentRequest {
  isActive: boolean;
}

export interface AcademicYearResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateAcademicYearRequest extends CreateAcademicYearRequest {
  isCurrent: boolean;
  isActive: boolean;
}

export interface SemesterResponse {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  academicYearId: string;
  academicYearName: string;
  isCurrent: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSemesterRequest {
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  academicYearId: string;
}

export interface UpdateSemesterRequest extends CreateSemesterRequest {
  isCurrent: boolean;
  isActive: boolean;
}

export interface FacultyResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  specialization: string;
  joiningDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateFacultyRequest {
  userId: string;
  departmentId: string;
  designation: string;
  specialization: string;
  joiningDate: string;
}

export interface UpdateFacultyRequest {
  departmentId: string;
  designation: string;
  specialization: string;
  joiningDate: string;
  isActive: boolean;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  isActive: boolean;
  roleId: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissionNames: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  isActive: boolean;
}

export interface PermissionResponse {
  id: string;
  name: string;
  description: string;
  group: string;
  isActive: boolean;
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  group: string;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalStudents: number;
  totalGuides: number;
  totalHods: number;
  totalColleges: number;
  totalDepartments: number;
  activeAcademicYears: number;
  recentLogs: AuditLogSummary[];
  usersByRole: Record<string, number>;
}

export interface AuditLogSummary {
  id: string;
  userName: string;
  action: string;
  entityName: string;
  timestamp: string;
}

export interface GlobalAnnouncementResponse {
  id: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  createdByName: string;
  createdAt: string;
  publishedAt: string | null;
}

export interface CreateGlobalAnnouncementRequest {
  title: string;
  content: string;
  priority: string;
}

export interface UpdateGlobalAnnouncementRequest {
  title: string;
  content: string;
  priority: string;
  status: string;
}

export interface AuditLogResponse {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValues: string;
  newValues: string;
  ipAddress: string;
  timestamp: string;
}

export interface SystemSettingResponse {
  id: string;
  key: string;
  value: string;
  description: string;
  group: string;
  isActive: boolean;
}

export interface UpdateSystemSettingRequest {
  value: string;
  description: string;
  isActive: boolean;
}
