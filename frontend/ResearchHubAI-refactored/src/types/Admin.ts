export interface CollegeResponse {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
  status?: string;
  subscriptionId?: string | null;
  storageLimitBytes?: number;
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
  subscriptionId?: string | null;
  storageLimitBytes?: number;
}

export interface UpdateCollegeRequest extends CreateCollegeRequest {
  isActive: boolean;
  status?: string;
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

export interface DepartmentResponse {
  id: string;
  departmentCode: string;
  departmentName: string;
  shortName?: string;
  description?: string;
  collegeId: string;
  collegeName: string;
  hodId?: string | null;
  hodName?: string | null;
  isActive: boolean;
  facultyCount: number;
  createdAt: string;
}

export interface CreateDepartmentRequest {
  departmentCode: string;
  departmentName: string;
  shortName?: string;
  description?: string;
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
  phoneNumber?: string | null;
  employeeId?: string | null;
  department?: string | null;
  college?: string | null;
  designation?: string | null;

  isFirstLogin: boolean;
  emailVerified: boolean;
  passwordChangedAt?: string | null;
  lastLoginAt?: string | null;
  updatedAt?: string | null;
  failedLoginCount: number;
  lockedUntil?: string | null;
  isLocked: boolean;

  status: string;
  invitationSentAt?: string | null;
  activatedAt?: string | null;
  temporaryPasswordExpiresAt?: string | null;

  enrollment?: string | null;
  researchTopic?: string | null;
  guideId?: string | null;
  guideName?: string | null;
  academicYearId?: string | null;
  academicYearName?: string | null;
  semesterId?: string | null;
  semesterName?: string | null;
  section?: string | null;

  joiningCohort?: string | null;
  registrationDate?: string | null;
  phdMode?: string | null;
  requiredCredits?: number | null;
  researchStageId?: string | null;
  researchStageName?: string | null;
  earnedCredits?: number | null;
  passedPapers?: number | null;
  pendingPapers?: number | null;
  courseworkStatus?: string | null;

  specialization?: string | null;
  bio?: string | null;
  qualification?: string | null;
  yearsOfExperience?: number | null;
  assignedStudents: number;
  researchStatus?: string | null;
  accountStatus: string;

  collegeId?: string | null;
  departmentId?: string | null;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password?: string;
  roleId: string;
  collegeId?: string | null;
  departmentId?: string | null;
  isActive: boolean;
  sendWelcomeEmail?: boolean;
  phoneNumber?: string | null;
  employeeId?: string | null;
  designation?: string | null;

  enrollment?: string | null;
  guideId?: string | null;
  academicYearId?: string | null;
  semesterId?: string | null;
  section?: string | null;
  researchTopic?: string | null;

  joiningCohort?: string | null;
  registrationDate?: string | null;
  phdMode?: string | null;
  requiredCredits?: number | null;
  researchStageId?: string | null;

  specialization?: string | null;
  bio?: string | null;

  qualification?: string | null;
  yearsOfExperience?: number | null;
}

export interface UpdateUserRequest extends CreateUserRequest {
  isActive: boolean;
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

export interface UpdatePermissionRequest {
  name: string;
  description: string;
  group: string;
}

export interface HodResponse {
  id: string;
  userId: string;
  employeeId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  collegeId: string;
  collegeName: string;
  designation?: string | null;
  qualification: string;
  yearsOfExperience: number;
  profilePhoto?: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  userStatus?: string | null;
  activatedAt?: string | null;
  lastLoginAt?: string | null;
  emailVerified: boolean;
  accountStatus: string;
}

export interface CreateHodRequest {
  fullName: string;
  email: string;
  phone?: string | null;
  employeeId?: string | null;
  designation?: string | null;
  password?: string | null;
  departmentId: string;
  qualification: string;
  yearsOfExperience: number;
  profilePhoto?: string | null;
  status?: string;
}

export interface UpdateHodRequest {
  fullName: string;
  email: string;
  phone?: string | null;
  employeeId?: string | null;
  designation?: string | null;
  departmentId: string;
  qualification: string;
  yearsOfExperience: number;
  profilePhoto?: string | null;
  status?: string;
  isActive: boolean;
}

export interface ResearchStageResponse {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateResearchStageRequest {
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateResearchStageRequest extends CreateResearchStageRequest {}

export interface ResearchCategoryResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  disciplineGroup: string;
  sortOrder: number;
  isActive: boolean;
  researchTopicCount: number;
}

export interface CreateResearchCategoryRequest {
  name: string;
  code: string;
  description: string;
  disciplineGroup: string;
  sortOrder: number;
}

export interface UpdateResearchCategoryRequest extends CreateResearchCategoryRequest {
  isActive: boolean;
}

export interface ResearchTopicResponse {
  id: string;
  title: string;
  description?: string;
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
  description?: string;
  categoryId: string;
  departmentId?: string | null;
}

export interface UpdateResearchTopicRequest {
  title: string;
  description?: string;
  categoryId: string;
  isActive: boolean;
}

export interface CourseworkResponse {
  id: string;
  studentProfileId: string;
  paperCode: string;
  paperName: string;
  credits: number;
  examType: string;
  examStatus: string;
  result?: string | null;
  marks?: number | null;
  grade?: string | null;
  attemptDate?: string | null;
  completedDate?: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CourseworkSummaryResponse {
  requiredCredits?: number | null;
  earnedCredits: number;
  remainingCredits: number;
  totalPapers: number;
  passedPapers: number;
  pendingPapers: number;
  failedPapers: number;
  courseworkStatus: string;
  completionPercentage: number;
}

export interface CreateCourseworkRequest {
  paperCode: string;
  paperName: string;
  credits: number;
  examType: string;
  examStatus: string;
  result?: string | null;
  marks?: number | null;
  grade?: string | null;
  attemptDate?: string | null;
  completedDate?: string | null;
}

export interface UpdateCourseworkRequest extends CreateCourseworkRequest {}

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
  courseworkInProgress: number;
  courseworkCompleted: number;
  researchInProgress: number;
  thesisSubmitted: number;
  completedScholars: number;
  recentLogs: AuditLogSummary[];
  usersByRole: Record<string, number>;
  monthlyActivity: MonthlyActivity[];
  departmentStats: DepartmentStat[];
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
  userAgent?: string | null;
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
