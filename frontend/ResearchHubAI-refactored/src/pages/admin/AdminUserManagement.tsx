import { useState, useEffect, useCallback, useRef } from "react";
import { Edit2, Filter, GraduationCap, Key, Plus, Search, Trash2, Eye, UserCheck, Users, ChevronDown, RefreshCw, AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import AccountStatusBadge from "../../components/common/AccountStatusBadge";
import Card from "../../components/common/Card";
import Pagination from "../../components/common/Pagination";
import UserFormModal from "../../components/admin/UserFormModal";
import UserViewDrawer from "../../components/admin/UserViewDrawer";
import DeleteConfirmDialog from "../../components/admin/DeleteConfirmDialog";
import { adminService } from "../../services/AdminService";
import type { PagedRequest } from "../../types/Pagination";
import type { UserResponse, RoleResponse } from "../../types/Admin";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<string>("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [viewUser, setViewUser] = useState<UserResponse | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (page: number, size: number, term: string, role: string, dept: string, college: string, status: string, sortF: string, sortD: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const req: PagedRequest = {
        pageNumber: page,
        pageSize: size,
        searchTerm: term || undefined,
        roleFilter: role || undefined,
        departmentFilter: dept || undefined,
        collegeFilter: college || undefined,
        statusFilter: status || undefined,
        sortField: sortF,
        sortDirection: sortD,
      };
      const result = await adminService.getUsersPaged(req, controller.signal);
      if (controller.signal.aborted) return;
      setUsers(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setHasNextPage(result.hasNextPage);
      setHasPreviousPage(result.hasPreviousPage);
    } catch (e) {
      if (controller.signal.aborted) return;
      if (e instanceof Error) setError(e.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, roleFilter, departmentFilter, collegeFilter, statusFilter]);

  useEffect(() => {
    fetchData(pageNumber, pageSize, debouncedSearch, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
  }, [fetchData, pageNumber, pageSize, debouncedSearch, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir]);

  useEffect(() => {
    adminService.getRoles().then(setRoles).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setPageNumber(1);
  };

  const handleAdd = () => { setEditUser(null); setModalOpen(true); };
  const handleEdit = (u: UserResponse) => { setEditUser(u); setModalOpen(true); };
  const handleView = (u: UserResponse) => { setViewUser(u); setViewOpen(true); };
  const handleDeleteClick = (u: UserResponse) => { setDeleteUser(u); };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await adminService.deleteUser(deleteUser.id);
      setSuccessMsg("User deleted successfully.");
      setDeleteUser(null);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData(pageNumber, pageSize, debouncedSearch, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleSendInvitation = async (u: UserResponse) => {
    setResendingId(u.id);
    try {
      await adminService.sendInvitation(u.id);
      setSuccessMsg(`Invitation email sent successfully to "${u.fullName}"`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData(pageNumber, pageSize, debouncedSearch, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send invitation";
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setResendingId(null);
    }
  };

  const handleSaved = () => {
    setSuccessMsg(editUser ? "User updated successfully" : "User created successfully");
    setTimeout(() => setSuccessMsg(null), 3000);
    fetchData(pageNumber, pageSize, debouncedSearch, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
  };

  const handlePageChange = (page: number) => setPageNumber(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  const handleRefresh = () => {
    fetchData(pageNumber, pageSize, debouncedSearch, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
  };

  const studentCount = users.filter((u) => u.roleName.toLowerCase() === "student").length;
  const guideCount = users.filter((u) => u.roleName.toLowerCase() === "guide").length;
  const adminCount = users.filter((u) => u.roleName.toLowerCase() === "collegeadmin" || u.roleName.toLowerCase() === "super admin").length;

  const SortIcon = ({ field }: { field: string }) => (
    <span className="inline-block ml-1 text-[10px] opacity-50">{sortField === field ? (sortDir === "asc" ? "\u25B2" : "\u25BC") : "\u21C5"}</span>
  );

  if (loading && users.length === 0 && pageNumber === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-xs text-green-600 dark:text-green-400">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={`${totalCount}`} icon={Users} color="bg-blue-500" />
        <StatCard label="Students" value={`${studentCount}`} icon={GraduationCap} color="bg-indigo-500" />
        <StatCard label="Guides" value={`${guideCount}`} icon={UserCheck} color="bg-green-500" />
        <StatCard label="College Admins" value={`${adminCount}`} icon={Key} color="bg-amber-500" />
      </div>

      <Card p={false}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border gap-2 sm:gap-3">
          <h3 className="font-bold text-foreground text-sm sm:text-base">All Users</h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:min-w-[200px] min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary w-full"
                placeholder="Search..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`text-xs border rounded-lg px-3 py-2 flex items-center gap-1.5 transition-colors touch-target ${showFilters ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600" : "border-border text-muted-foreground hover:bg-muted"}`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <button onClick={handleAdd} className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors touch-target">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-border bg-muted/20">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none text-foreground w-full sm:w-auto"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
            <input
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none text-foreground w-full sm:w-32"
              placeholder="Department..."
            />
            <input
              value={collegeFilter}
              onChange={(e) => { setCollegeFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none text-foreground w-full sm:w-32"
              placeholder="College..."
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none text-foreground w-full sm:w-auto"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="invitationsent">Invitation Sent</option>
              <option value="emailverified">Email Verified</option>
              <option value="locked">Locked</option>
              <option value="disabled">Disabled</option>
            </select>
            <button
              onClick={handleRefresh}
              className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted flex items-center gap-1.5 touch-target w-full sm:w-auto justify-center"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted/40">
              <tr>
                {[
                  { key: "fullName", label: "User" },
                  { key: "employeeId", label: "ID" },
                  { key: "email", label: "Email" },
                  { key: "roleName", label: "Role" },
                  { key: "accountStatus", label: "Status" },
                  { key: "createdAt", label: "Joined" },
                  { key: "", label: "Actions" },
                ].map((h) => (
                  <th
                    key={h.label}
                    onClick={() => h.key && handleSort(h.key)}
                    className={`text-left px-3 sm:px-5 py-3 text-[10px] sm:text-xs font-semibold text-muted-foreground whitespace-nowrap ${h.key ? "cursor-pointer hover:text-foreground select-none" : ""}`}
                  >
                    {h.label}
                    {h.key && <SortIcon field={h.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-border hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => handleView(u)}
                >
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar name={u.fullName} size="sm" />
                      <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-none">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-[10px] sm:text-xs font-mono font-semibold text-foreground whitespace-nowrap">{u.enrollment || u.employeeId || "—"}</td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">{u.email}</td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <Badge
                      variant={
                        u.roleName.toLowerCase() === "collegeadmin" || u.roleName.toLowerCase() === "super admin"
                          ? "info"
                          : u.roleName.toLowerCase() === "hod"
                            ? "purple"
                            : u.roleName.toLowerCase() === "guide"
                              ? "success"
                              : "outline"
                      }
                    >
                      {u.roleName}
                    </Badge>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <AccountStatusBadge status={u.accountStatus} />
                    {u.emailVerified && (
                      <span className="ml-1 text-[10px] text-green-600 dark:text-green-400 font-medium hidden sm:inline">(Verified)</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-3.5">
                    <div className="flex gap-0.5 sm:gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleView(u)}
                        className="p-1.5 sm:p-1.5 text-muted-foreground hover:text-blue-600 transition-colors touch-target"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-1.5 sm:p-1.5 text-muted-foreground hover:text-amber-600 transition-colors touch-target"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSendInvitation(u)}
                        disabled={resendingId === u.id}
                        className="p-1.5 sm:p-1.5 text-muted-foreground hover:text-green-600 transition-colors disabled:opacity-40 touch-target"
                        title="Send Invitation Email"
                      >
                        {resendingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(u)}
                        className="p-1.5 sm:p-1.5 text-muted-foreground hover:text-red-600 transition-colors touch-target"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-12">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  Loading...
                </div>
              ) : (
                "No users found matching your criteria"
              )}
            </div>
          )}
        </div>

        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      <UserFormModal
        open={modalOpen}
        user={editUser}
        onClose={() => { setModalOpen(false); setEditUser(null); }}
        onSaved={handleSaved}
      />

      <UserViewDrawer
        open={viewOpen}
        userId={viewUser?.id || null}
        user={viewUser}
        onClose={() => { setViewOpen(false); setViewUser(null); }}
      />

      <DeleteConfirmDialog
        open={!!deleteUser}
        userName={deleteUser?.fullName || ""}
        deleting={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteUser(null)}
      />
    </div>
  );
}
