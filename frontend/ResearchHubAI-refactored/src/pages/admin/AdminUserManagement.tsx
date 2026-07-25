import { useState, useEffect, useCallback, useRef } from "react";
import { Edit2, Filter, GraduationCap, Key, Plus, Search, Trash2, Eye, UserCheck, Users, ChevronDown, RefreshCw, AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Pagination from "../../components/common/Pagination";
import UserFormModal from "../../components/admin/UserFormModal";
import UserViewDrawer from "../../components/admin/UserViewDrawer";
import DeleteConfirmDialog from "../../components/admin/DeleteConfirmDialog";
import { adminService } from "../../services/AdminService";
import type { UserResponse, RoleResponse } from "../../types/Admin";

function AccountStatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;
  switch (status.toLowerCase()) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "invitationsent":
    case "invitation sent":
      return <Badge variant="warning">Invitation Sent</Badge>;
    case "emailverified":
    case "email verified":
      return <Badge variant="info">Email Verified</Badge>;
    case "locked":
      return <Badge variant="danger">Locked</Badge>;
    case "disabled":
      return <Badge variant="danger">Disabled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

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
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<string>("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [viewUser, setViewUser] = useState<UserResponse | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchData = useCallback(async (page: number, size: number, term: string, role: string, dept: string, college: string, status: string, sortF: string, sortD: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers();
      const filtered = data.filter(u => {
        if (role && u.roleName.toLowerCase() !== role.toLowerCase()) return false;
        if (dept && u.department?.toLowerCase() !== dept.toLowerCase()) return false;
        if (college && u.college?.toLowerCase() !== college.toLowerCase()) return false;
        if (status) {
          const st = status.toLowerCase();
          const acctStatus = (u.accountStatus || "").toLowerCase();
          if (st === "active" && acctStatus !== "active") return false;
          if (st === "draft" && acctStatus !== "draft") return false;
          if (st === "invitationsent" && acctStatus !== "invitationsent" && acctStatus !== "invitation sent") return false;
          if (st === "emailverified" && acctStatus !== "emailverified" && acctStatus !== "email verified") return false;
          if (st === "locked" && acctStatus !== "locked") return false;
          if (st === "disabled" && acctStatus !== "disabled") return false;
        }
        if (term) {
          const t = term.toLowerCase();
          if (!u.fullName.toLowerCase().includes(t) && !u.email.toLowerCase().includes(t) && !(u.employeeId?.toLowerCase() || '').includes(t) && !(u.phoneNumber?.toLowerCase() || '').includes(t)) return false;
        }
        return true;
      });
      const sorted = [...filtered].sort((a, b) => {
        const af = (a as any)[sortF]?.toString().toLowerCase() || '';
        const bf = (b as any)[sortF]?.toString().toLowerCase() || '';
        return sortD === 'asc' ? af.localeCompare(bf) : bf.localeCompare(af);
      });
      setUsers(sorted);
      setTotalCount(sorted.length);
      setTotalPages(Math.max(1, Math.ceil(sorted.length / size)));
      setHasNextPage(page < Math.ceil(sorted.length / size));
      setHasPreviousPage(page > 1);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(pageNumber, pageSize, search, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
  }, [fetchData, pageNumber, pageSize, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir]);

  useEffect(() => {
    adminService.getRoles().then(setRoles).catch(() => {});
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPageNumber(1);
    }, 400);
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
      setSuccessMsg(`"${deleteUser.fullName}" deleted successfully`);
      setDeleteUser(null);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData(pageNumber, pageSize, search, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
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
      fetchData(pageNumber, pageSize, search, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
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
    fetchData(pageNumber, pageSize, search, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
  };

  const handlePageChange = (page: number) => setPageNumber(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  const handleRefresh = () => {
    fetchData(pageNumber, pageSize, search, roleFilter, departmentFilter, collegeFilter, statusFilter, sortField, sortDir);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-border gap-3">
          <h3 className="font-bold text-foreground">All Users</h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-primary w-full"
                placeholder="Search by name, email, ID, phone..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`text-xs border rounded-lg px-3 py-2 flex items-center gap-1.5 transition-colors ${showFilters ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600" : "border-border text-muted-foreground hover:bg-muted"}`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <button onClick={handleAdd} className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add User
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-border bg-muted/20">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none text-foreground"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
            <input
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none text-foreground w-40"
              placeholder="Department..."
            />
            <input
              value={collegeFilter}
              onChange={(e) => { setCollegeFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none text-foreground w-36"
              placeholder="College..."
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs outline-none text-foreground"
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
              className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {[
                  { key: "fullName", label: "User" },
                  { key: "email", label: "Email" },
                  { key: "roleName", label: "Role" },
                  { key: "accountStatus", label: "Status" },
                  { key: "createdAt", label: "Joined" },
                  { key: "", label: "Actions" },
                ].map((h) => (
                  <th
                    key={h.label}
                    onClick={() => h.key && handleSort(h.key)}
                    className={`text-left px-5 py-3 text-xs font-semibold text-muted-foreground ${h.key ? "cursor-pointer hover:text-foreground select-none" : ""}`}
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
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} size="sm" />
                      <span className="text-xs font-bold text-foreground">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3.5">
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
                  <td className="px-5 py-3.5">
                    <AccountStatusBadge status={u.accountStatus} />
                    {u.emailVerified && (
                      <span className="ml-1.5 text-[10px] text-green-600 dark:text-green-400 font-medium">(Verified)</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleView(u)}
                        className="p-1.5 text-muted-foreground hover:text-blue-600 transition-colors"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-1.5 text-muted-foreground hover:text-amber-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSendInvitation(u)}
                        disabled={resendingId === u.id}
                        className="p-1.5 text-muted-foreground hover:text-green-600 transition-colors disabled:opacity-40"
                        title="Send Invitation Email"
                      >
                        {resendingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(u)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
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
