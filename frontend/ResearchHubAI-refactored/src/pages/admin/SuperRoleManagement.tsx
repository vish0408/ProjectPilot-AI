import { useState, useEffect, useCallback, useRef } from "react";
import { Check, Edit2, Eye, Lock, Mail, Plus, RefreshCw, Search, Shield, Trash2, UserX, X, type LucideIcon } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import AccountStatusBadge from "../../components/common/AccountStatusBadge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Pagination from "../../components/common/Pagination";
import UserFormModal from "../../components/admin/UserFormModal";
import UserViewDrawer from "../../components/admin/UserViewDrawer";
import DeleteConfirmDialog from "../../components/admin/DeleteConfirmDialog";
import AcademicYearSelect from "../../components/admin/AcademicYearSelect";
import SemesterSelect from "../../components/admin/SemesterSelect";
import { adminService } from "../../services/AdminService";
import { authService } from "../../services/AuthService";
import type { UserResponse, CollegeResponse, DepartmentResponse } from "../../types/Admin";

export type RoleBadgeVariant = "info" | "purple" | "success" | "outline";

export interface RoleManagementConfig {
  roleName: string;
  title: string;
  description: string;
  idLabel: string;
  idField: "employeeId" | "enrollment";
  statTotalLabel: string;
  badgeVariant: RoleBadgeVariant;
  statIcon: LucideIcon;
  statColor: string;
  showDepartment: boolean;
  showGuideFilter: boolean;
  showAssignedStudents: boolean;
  showResearchStatus: boolean;
  showGuideColumn: boolean;
}

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); } catch { return d; }
}

export default function SuperRoleManagement({ config }: { config: RoleManagementConfig }) {
  const [response, setResponse] = useState<UserResponse[]>([]);
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [guides, setGuides] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterGuide, setFilterGuide] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("fullname");
  const [sortDirection, setSortDirection] = useState("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState<UserResponse | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };
  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(null), 5000); };

  const loadStats = useCallback(async () => {
    try {
      const all = await adminService.getUsers();
      setAllUsers((all ?? []).filter(u => u.roleName === config.roleName));
    } catch (e) { if (e instanceof Error) showError(e.message); }
  }, [config.roleName]);

  const loadColleges = useCallback(async () => {
    try {
      const colls = await adminService.getColleges();
      setColleges(colls);
    } catch { setColleges([]); }
  }, []);

  const loadDepartments = useCallback(async (collegeId?: string) => {
    try {
      const depts = collegeId ? await adminService.getAllDepartments(collegeId) : await adminService.getAllDepartments();
      setDepartments((depts ?? []).filter(d => d.isActive));
    } catch { setDepartments([]); }
  }, []);

  const loadGuides = useCallback(async () => {
    try {
      const all = await adminService.getUsers();
      setGuides((all ?? []).filter(u => u.roleName === "Guide"));
    } catch { setGuides([]); }
  }, []);

  useEffect(() => { loadStats(); loadColleges(); loadDepartments(); if (config.showGuideFilter) loadGuides(); }, []);

  const fetchData = useCallback(async (page?: number, size?: number, searchTerm?: string, pageChanged?: boolean) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (!pageChanged) setLoading(true);
    const p = page ?? pageNumber;
    const s = size ?? pageSize;
    const term = searchTerm ?? search;
    try {
      const res = await adminService.getUsersPaged({
        pageNumber: p,
        pageSize: s,
        searchTerm: term || undefined,
        roleFilter: config.roleName,
        collegeFilter: filterCollege || undefined,
        departmentFilter: filterDepartment || undefined,
        guideFilter: config.showGuideFilter ? (filterGuide || undefined) : undefined,
        academicYearFilter: config.showGuideFilter ? (filterAcademicYear || undefined) : undefined,
        semesterFilter: config.showGuideFilter ? (filterSemester || undefined) : undefined,
        statusFilter: filterStatus || undefined,
        sortField,
        sortDirection,
      }, controller.signal);
      if (controller.signal.aborted) return;
      setResponse(res.items);
      setTotalCount(res.totalCount);
      setPageNumber(p);
      setPageSize(s);
    } catch (e) {
      if (controller.signal.aborted) return;
      if (e instanceof Error) showError(e.message);
    }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, [search, filterCollege, filterDepartment, filterGuide, filterAcademicYear, filterSemester, filterStatus, sortField, sortDirection, pageNumber, pageSize, config.roleName, config.showGuideFilter]);

  useEffect(() => { fetchData(1); }, []);

  const handleSearch = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(term);
      setPageNumber(1);
      fetchData(1, undefined, term);
    }, 300);
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleCollegeFilter = (value: string) => {
    setFilterCollege(value);
    setFilterDepartment("");
    setPageNumber(1);
    loadDepartments(value || undefined);
  };

  const handleSaved = async () => {
    await fetchData(pageNumber);
    await loadStats();
  };

  const handleToggleActive = async (u: UserResponse) => {
    setActionLoading(`toggle-${u.id}`);
    try {
      await adminService.updateUser(u.id, {
        fullName: u.fullName,
        email: u.email,
        isActive: !u.isActive,
        roleId: u.roleId,
        collegeId: u.collegeId || undefined,
        departmentId: u.departmentId || undefined,
        phoneNumber: u.phoneNumber || undefined,
        employeeId: u.employeeId || undefined,
        designation: u.designation || undefined,
        enrollment: u.enrollment || undefined,
        guideId: u.guideId || undefined,
        academicYearId: u.academicYearId || undefined,
        semesterId: u.semesterId || undefined,
        section: u.section || undefined,
        researchTopic: u.researchTopic || undefined,
        specialization: u.specialization || undefined,
        bio: u.bio || undefined,
        qualification: u.qualification || undefined,
        yearsOfExperience: u.yearsOfExperience ?? undefined,
      });
      setResponse(prev => prev.map(i => i.id === u.id ? { ...i, isActive: !i.isActive } : i));
      setAllUsers(prev => prev.map(i => i.id === u.id ? { ...i, isActive: !i.isActive } : i));
      showSuccess(`${u.fullName} ${u.isActive ? "deactivated" : "activated"} successfully.`);
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setActionLoading(deleteUser.id);
    try {
      await adminService.deleteUser(deleteUser.id);
      await fetchData(pageNumber > 1 && response.length <= 1 ? pageNumber - 1 : pageNumber);
      await loadStats();
      showSuccess("User deleted successfully.");
      setDeleteUser(null);
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleResendInvitation = async (u: UserResponse) => {
    setActionLoading(`resend-${u.id}`);
    try {
      await adminService.resendInvitation(u.id);
      showSuccess("Invitation resent successfully.");
      await fetchData();
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleResetPassword = async (u: UserResponse) => {
    setActionLoading(`reset-${u.id}`);
    try {
      await authService.forgotPassword(u.email);
      showSuccess("Password reset email sent to " + u.email);
    } catch (e) { if (e instanceof Error) showError(e.message); }
    finally { setActionLoading(null); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const active = allUsers.filter(u => u.accountStatus === "Active").length;
  const pending = allUsers.filter(u => u.accountStatus === "Pending Activation" || u.accountStatus === "Invitation Sent").length;
  const inactive = allUsers.filter(u => u.accountStatus === "Inactive").length;
  const StatIcon = config.statIcon;

  const researchStatusColor = (s?: string | null) => {
    switch (s) {
      case "Completed": return "text-green-600 dark:text-green-400";
      case "In Progress": return "text-blue-600 dark:text-blue-400";
      case "On Hold": return "text-amber-600 dark:text-amber-400";
      case "Not Started": return "text-slate-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <p className="text-xs text-green-700 dark:text-green-300">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)}><X className="w-4 h-4 text-green-500" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label={config.statTotalLabel} value={`${allUsers.length}`} icon={StatIcon} color={config.statColor} />
        <StatCard label="Active" value={`${active}`} sub="Active" icon={Shield} color="bg-green-500" />
        <StatCard label="Pending Invitations" value={`${pending}`} sub="Awaiting activation" icon={Mail} color="bg-amber-500" />
        <StatCard label="Inactive" value={`${inactive}`} sub="Inactive" icon={UserX} color="bg-red-500" />
      </div>

      <SectionHead title={config.title} desc={config.description}
        action={
          <button onClick={() => { setEditUser(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add {config.roleName}
          </button>
        }
      />

      <Card>
        <div className="flex items-center gap-3 px-1 pb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input onChange={e => handleSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchData(1)} placeholder={`Search by ${config.idLabel}, Name, Email, Phone, College${config.showDepartment ? ", Department" : ""}${config.showGuideFilter ? ", Academic Year, Semester" : ""}...`}
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            {search && <button onClick={() => { setSearch(""); setPageNumber(1); fetchData(1); }}><X className="w-4 h-4 text-muted-foreground" /></button>}
          </div>
          <select value={filterCollege} onChange={e => handleCollegeFilter(e.target.value)}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Colleges</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {config.showDepartment && (
            <select value={filterDepartment} onChange={e => { setFilterDepartment(e.target.value); setPageNumber(1); }}
              className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
            </select>
          )}
          {config.showGuideFilter && (
            <select value={filterGuide} onChange={e => { setFilterGuide(e.target.value); setPageNumber(1); }}
              className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
              <option value="">All Guides</option>
              {guides.map(g => <option key={g.id} value={g.id}>{g.fullName}</option>)}
            </select>
          )}
          {config.showGuideFilter && (
            <div className="min-w-[160px]">
              <AcademicYearSelect
                value={filterAcademicYear}
                onChange={(v) => { setFilterAcademicYear(v); setFilterSemester(""); setPageNumber(1); }}
                allowClear
                autoSelectCurrent={false}
                placeholder="All Academic Years"
              />
            </div>
          )}
          {config.showGuideFilter && (
            <div className="min-w-[140px]">
              <SemesterSelect
                value={filterSemester}
                academicYearId={filterAcademicYear}
                onChange={(v) => { setFilterSemester(v); setPageNumber(1); }}
                allowClear
                placeholder="All Semesters"
              />
            </div>
          )}
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPageNumber(1); }}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending Activation</option>
            <option value="invitationsent">Invitation Sent</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
            <option value="disabled">Disabled</option>
          </select>
          <select value={sortField} onChange={e => setSortField(e.target.value)}
            className="bg-input-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="fullname">Name</option>
            <option value="employeeid">Employee ID</option>
            <option value="email">Email</option>
            <option value="college">College</option>
            {config.showDepartment && <option value="department">Department</option>}
            <option value="status">Status</option>
            <option value="createdat">Created Date</option>
          </select>
          <button onClick={() => { setSortDirection(d => d === "asc" ? "desc" : "asc"); }}
            className="border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
            {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{config.idLabel}</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Name</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Email</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">Phone</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">College</th>
                {config.showDepartment && <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">Department</th>}
                {config.showAssignedStudents && <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">Assigned Students</th>}
                {config.showGuideColumn && <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">Guide</th>}
                {config.showResearchStatus && <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Research Status</th>}
                <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden lg:table-cell">Created</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {response.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 text-xs font-mono text-foreground font-semibold whitespace-nowrap">{(config.idField === "enrollment" ? u.enrollment : u.employeeId) || "—"}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 ${config.statColor} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground whitespace-nowrap">{u.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">{u.designation || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">{u.email}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">{u.phoneNumber || "—"}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">{u.college || "—"}</td>
                  {config.showDepartment && <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell">{u.department || "—"}</td>}
                  {config.showAssignedStudents && (
                    <td className="py-3 px-3 text-center whitespace-nowrap hidden lg:table-cell">
                      <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{u.assignedStudents ?? 0}</span>
                    </td>
                  )}
                  {config.showGuideColumn && <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell">{u.guideName || "Not assigned"}</td>}
                  {config.showResearchStatus && (
                    <td className="py-3 px-3 text-xs font-medium whitespace-nowrap">
                      <span className={researchStatusColor(u.researchStatus)}>{u.researchStatus || "No Project"}</span>
                    </td>
                  )}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <AccountStatusBadge status={u.accountStatus} />
                      {u.emailVerified && <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Verified</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell">{fmtDate(u.createdAt)}</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setViewUser(u); setViewOpen(true); }}
                        className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:scale-105 transition-all flex items-center justify-center touch-target"
                        title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditUser(u); setFormOpen(true); }}
                        className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:scale-105 transition-all flex items-center justify-center touch-target"
                        title="Edit user">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleActive(u)} disabled={actionLoading === `toggle-${u.id}`}
                        className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 hover:scale-105 transition-all flex items-center justify-center touch-target disabled:opacity-50"
                        title={u.isActive ? "Deactivate user" : "Activate user"}>
                        {actionLoading === `toggle-${u.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <div className="relative group">
                        <button
                          className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:scale-105 transition-all flex items-center justify-center touch-target"
                          title="Email actions">
                          <Mail className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block group-focus-within:block min-w-[180px] bg-card border border-border rounded-xl shadow-xl py-1">
                          <button onClick={() => handleResendInvitation(u)} disabled={actionLoading === `resend-${u.id}`}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                            {actionLoading === `resend-${u.id}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Resend Invitation
                          </button>
                          <button onClick={() => handleResetPassword(u)} disabled={actionLoading === `reset-${u.id}`}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                            {actionLoading === `reset-${u.id}` ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                            Reset Password
                          </button>
                        </div>
                      </div>
                      <button onClick={() => setDeleteUser(u)}
                        className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 hover:scale-105 transition-all flex items-center justify-center touch-target"
                        title="Delete user">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={12} className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !response.length && (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-sm text-muted-foreground">
                    {search || filterCollege || filterDepartment || filterGuide || filterStatus ? "No users match your filters" : `No ${config.roleName} users found. Add the first one above.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          hasNextPage={pageNumber < totalPages}
          hasPreviousPage={pageNumber > 1}
          onPageChange={p => fetchData(p)}
          pageSize={pageSize}
          onPageSizeChange={size => fetchData(1, size)}
        />
      </Card>

      <UserFormModal
        open={formOpen}
        user={editUser}
        onClose={() => { setFormOpen(false); setEditUser(null); }}
        onSaved={handleSaved}
        lockedRoleName={config.roleName}
      />

      <UserViewDrawer
        open={viewOpen}
        userId={viewUser?.id ?? null}
        user={viewUser}
        onClose={() => { setViewOpen(false); setViewUser(null); }}
      />

      <DeleteConfirmDialog
        open={!!deleteUser}
        userName={deleteUser?.fullName ?? ""}
        deleting={!!deleteUser && actionLoading === deleteUser.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
      />
    </div>
  );
}
