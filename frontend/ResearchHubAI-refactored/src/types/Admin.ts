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

export interface CollegeAnalyticsResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  departmentCount: number;
  studentCount: number;
  guideCount: number;
  hodCount: number;
  collegeAdminCount: number;
  researchCount: number;
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
  departmentName: string;
  departmentCode: string;
  shortName: string;
  description: string;
  collegeId: string;
  collegeName: string;
  hodId?: string | null;
  hodName?: string | null;
  isActive: boolean;
  facultyCount: number;
  createdAt: string;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  departmentCode: string;
  shortName: string;
  description: string;
  collegeId: string;
}

export interface UpdateDepartmentRequest {
  departmentName: string;
  departmentCode: string;
  shortName: string;
  description: string;
  collegeId: string;
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
  phoneNumber?: string | null;
  employeeId?: string | null;
  collegeId?: string | null;
  departmentId?: string | null;
  department?: string | null;
  college?: string | null;
  designation?: string | null;
  isFirstLogin?: boolean;
  emailVerified?: boolean;
  passwordChangedAt?: string | null;
  lastLoginAt?: string | null;
  failedLoginCount?: number;
  lockedUntil?: string | null;
  temporaryPasswordExpiresAt?: string | null;
  accountStatus?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password?: string;
  roleId: string;
  collegeId?: string;
  departmentId?: string;
  isActive: boolean;
  sendWelcomeEmail?: boolean;
  phoneNumber?: string;
  employeeId?: string;
  designation?: string;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  isActive: boolean;
  roleId: string;
  collegeId?: string;
  departmentId?: string;
  phoneNumber?: string;
  employeeId?: string;
  designation?: string;
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

export interface UpdatePermissionRequest {
  name: string;
  description: string;
  group: string;
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
  activeGuides: number;
  totalHods: number;
  activeHods: number;
  totalCollegeAdmins: number;
  activeCollegeAdmins: number;
  totalColleges: number;
  totalDepartments: number;
  activeAcademicYears: number;
  recentLogs: AuditLogSummary[];
  usersByRole: Record<string, number>;
  monthlyActivity: MonthlyActivity[];
  departmentStats: DepartmentStat[];
}

export interface MonthlyActivity {
  month: string;
  submissions: number;
  approvals: number;
  meetings: number;
}

export interface DepartmentStat {
  name: string;
  students: number;
  completed: number;
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

export interface BackupRecordResponse {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeDisplay: string;
  status: string;
  errorMessage?: string;
  createdByUserName: string;
  createdAt: string;
  completedAt?: string;
}

export interface ResearchTopicResponse {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  createdByName: string;
  createdAt: string;
  departmentId?: string | null;
  departmentName?: string | null;
}

export interface CreateResearchTopicRequest {
  title: string;
  description: string;
  categoryId: string;
  departmentId?: string | null;
}

export interface UpdateResearchTopicRequest {
  title: string;
  description: string;
  categoryId: string;
  isActive: boolean;
}

export interface HodResponse {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  collegeId: string;
  collegeName: string;
  designation: string;
  qualification: string;
  yearsOfExperience: number;
  profilePhoto?: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateHodRequest {
  fullName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  designation?: string;
  password?: string;
  departmentId: string;
  qualification: string;
  yearsOfExperience: number;
  profilePhoto?: string;
  status: string;
}

export interface UpdateHodRequest {
  fullName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  designation?: string;
  departmentId: string;
  qualification: string;
  yearsOfExperience: number;
  profilePhoto?: string;
  status: string;
  isActive: boolean;
}
