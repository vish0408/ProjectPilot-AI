import { useEffect, useState, useCallback } from "react";
import {
  GraduationCap, Search, Users, X, Eye, UserPlus, Loader2,
  Mail, Phone, Building, BookOpen, UserCheck, Activity, Shield, AlertTriangle,
  CheckCircle, XCircle, Hash, ChevronRight
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import ProgressBar from "../../components/common/ProgressBar";
import Pagination from "../../components/common/Pagination";
import { hodService } from "../../services/HodService";
import { HodStudentSummary, StudentDetail, HodGuideSummary } from "../../types/Hod";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "withGuide", label: "With Guide" },
  { key: "withoutGuide", label: "Without Guide" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
] as const;

const statusBadgeVariant = (status: string | null) => {
  if (!status) return "outline" as const;
  if (status === "Completed") return "success" as const;
  if (status === "InProgress") return "warning" as const;
  return "outline" as const;
};

const statusLabel = (status: string | null) => {
  if (!status) return "No Project";
  if (status === "NotStarted") return "Not Started";
  return status.replace(/([A-Z])/g, " $1").trim();
};

export default function HodStudents() {
  const [students, setStudents] = useState<HodStudentSummary[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignStudentId, setAssignStudentId] = useState<string | null>(null);
  const [assignStudentName, setAssignStudentName] = useState("");
  const [guides, setGuides] = useState<HodGuideSummary[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [assignRemarks, setAssignRemarks] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStudent, setConfirmStudent] = useState<HodStudentSummary | null>(null);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate">("activate");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchStudents = useCallback(async (
    term: string | undefined,
    filter: string,
    page: number,
    size: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await hodService.getStudents(term, {
        pageNumber: page,
        pageSize: size,
        statusFilter: filter === "all" ? undefined : filter,
      });
      setStudents(data.items);
      setPageNumber(data.pageNumber);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setHasNextPage(data.hasNextPage);
      setHasPreviousPage(data.hasPreviousPage);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(undefined, activeFilter, pageNumber, pageSize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNumber(1);
      fetchStudents(search || undefined, activeFilter, 1, pageSize);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPageNumber(1);
    fetchStudents(search || undefined, activeFilter, 1, pageSize);
  }, [activeFilter]);

  const handlePageChange = (page: number) => {
    fetchStudents(search || undefined, activeFilter, page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    fetchStudents(search || undefined, activeFilter, 1, size);
  };

  const handleViewDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setDrawerOpen(true);
    setDetailLoading(true);
    setStudentDetail(null);
    try {
      const detail = await hodService.getStudentDetail(userId);
      setStudentDetail(detail);
    } catch (_) {
      setStudentDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenAssign = async (student: HodStudentSummary) => {
    setAssignStudentId(student.userId);
    setAssignStudentName(student.fullName);
    setAssignOpen(true);
    setSelectedGuideId("");
    setAssignRemarks("");
    setAssignError(null);
    setGuidesLoading(true);
    try {
      const g = await hodService.getGuides();
      setGuides(g);
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Failed to load guides");
    } finally {
      setGuidesLoading(false);
    }
  };

  const handleAssignGuide = async () => {
    if (!assignStudentId || !selectedGuideId) return;
    setAssigning(true);
    setAssignError(null);
    try {
      await hodService.assignStudentGuide(assignStudentId, selectedGuideId, assignRemarks || undefined);
      setAssignOpen(false);
      fetchStudents(search || undefined, activeFilter, pageNumber, pageSize);
      if (drawerOpen && selectedUserId === assignStudentId) {
        const detail = await hodService.getStudentDetail(assignStudentId);
        setStudentDetail(detail);
      }
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : "Failed to assign guide");
    } finally {
      setAssigning(false);
    }
  };

  const handleToggleStatus = (student: HodStudentSummary, action: "activate" | "deactivate") => {
    setConfirmStudent(student);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmStudent) return;
    setConfirmLoading(true);
    try {
      await hodService.toggleStudentStatus(confirmStudent.userId, confirmAction === "activate");
      setConfirmOpen(false);
      setConfirmStudent(null);
      fetchStudents(search || undefined, activeFilter, pageNumber, pageSize);
      if (drawerOpen && selectedUserId === confirmStudent.userId) {
        const detail = await hodService.getStudentDetail(confirmStudent.userId);
        setStudentDetail(detail);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const withGuideCount = students.filter((s) => s.guideName).length;
  const hasProjectCount = students.filter((s) => s.projectTitle).length;
  const avgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + s.completionPercentage, 0) / students.length)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={`${totalCount}`} icon={GraduationCap} color="bg-blue-500" />
        <StatCard label="With Guide" value={`${withGuideCount}`} icon={Users} color="bg-green-500" />
        <StatCard label="Has Project" value={`${hasProjectCount}`} icon={GraduationCap} color="bg-amber-500" />
        <StatCard label="Avg Progress" value={avgProgress + "%"} icon={GraduationCap} color="bg-indigo-500" />
      </div>

      <Card p={false}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, or enrollment..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1 px-5 py-3 border-b border-border overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeFilter === f.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {students.map((s) => (
            <div
              key={s.userId}
              className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
            >
              <Avatar name={s.fullName} />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-5 gap-3 items-start">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enrollment</p>
                  <p className="text-xs font-medium text-foreground">{s.enrollment}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-xs font-medium text-foreground truncate">{s.department}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Guide</p>
                  {s.guideName ? (
                    <button
                      onClick={() => handleViewDetail(s.userId)}
                      className="text-xs font-medium text-primary hover:underline truncate flex items-center gap-1"
                    >
                      {s.guideName}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Not assigned</p>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-bold">{s.completionPercentage}%</span>
                  </div>
                  <ProgressBar value={s.completionPercentage} />
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end gap-1.5 flex-shrink-0">
                <Badge variant={statusBadgeVariant(s.projectStatus)}>
                  {statusLabel(s.projectStatus)}
                </Badge>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleViewDetail(s.userId)}
                  title="View Profile"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenAssign(s)}
                  title="Assign Guide"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(s, "activate")}
                  title="Activate"
                  className="p-1.5 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(s, "deactivate")}
                  title="Deactivate"
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {!students.length && (
            <p className="text-sm text-muted-foreground text-center py-8">No students found</p>
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

      {/* Detail Drawer */}
      {drawerOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-card border-l border-border h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-card z-10 flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Student Profile</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !studentDetail ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                Student not found
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-border">
                  <Avatar name={studentDetail.fullName} size="lg" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{studentDetail.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{studentDetail.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={studentDetail.isActive ? "success" : "danger"}>
                      {studentDetail.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {studentDetail.roles.map((r) => (
                      <Badge key={r} variant="info">{r}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{studentDetail.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{studentDetail.phoneNumber || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Academic Info</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Hash className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Enrollment</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">{studentDetail.enrollment}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Building className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Department</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">{studentDetail.department}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Building className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">College</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">{studentDetail.college}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Research Topic</p>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate" title={studentDetail.researchTopic}>
                        {studentDetail.researchTopic || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Guide Information</h4>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Guide</p>
                      <p className="text-sm font-medium text-foreground">
                        {studentDetail.guideName || "Not assigned"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Project</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Title</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {studentDetail.projectTitle || "No project"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Status</p>
                      </div>
                      <Badge variant={statusBadgeVariant(studentDetail.projectStatus)}>
                        {statusLabel(studentDetail.projectStatus)}
                      </Badge>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Activity className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Completion</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar value={studentDetail.completionPercentage} />
                        </div>
                        <span className="text-xs font-bold text-foreground">{studentDetail.completionPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Activity className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Status</p>
                      </div>
                      <Badge variant={studentDetail.isActive ? "success" : "danger"}>
                        {studentDetail.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Roles</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">{studentDetail.roles.join(", ") || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Guide Modal */}
      {assignOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setAssignOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Assign Guide</h2>
              <button
                onClick={() => setAssignOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Assign a guide to <span className="font-bold text-foreground">{assignStudentName}</span>
              </p>

              {assignError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">{assignError}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Select Guide</label>
                {guidesLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading guides...
                  </div>
                ) : (
                  <select
                    value={selectedGuideId}
                    onChange={(e) => setSelectedGuideId(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm outline-none text-foreground"
                  >
                    <option value="">-- Choose a guide --</option>
                    {guides.map((g) => (
                      <option key={g.userId} value={g.userId}>
                        {g.fullName} ({g.department}){!g.isAvailable ? " [Unavailable]" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Remarks (optional)</label>
                <textarea
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  rows={2}
                  placeholder="Any additional remarks..."
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm outline-none text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setAssignOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignGuide}
                  disabled={assigning || !selectedGuideId}
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                  {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                  {assigning ? "Assigning..." : "Assign Guide"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmOpen && confirmStudent && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmOpen(false);
              setConfirmStudent(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {confirmAction === "activate" ? "Activate Student" : "Deactivate Student"}
              </h2>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmStudent(null);
                }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center text-center gap-3 mb-5">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    confirmAction === "deactivate"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-green-100 dark:bg-green-900/30"
                  }`}
                >
                  {confirmAction === "deactivate" ? (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {confirmAction === "activate" ? "Activate Student" : "Deactivate Student"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Are you sure you want to {confirmAction}{" "}
                    <span className="font-bold text-foreground">{confirmStudent.fullName}</span>?
                    {confirmAction === "deactivate"
                      ? " They will not be able to log in until reactivated."
                      : " They will regain access to the system."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmStudent(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggle}
                  disabled={confirmLoading}
                  className={`px-6 py-2.5 text-sm font-bold rounded-xl text-white flex items-center gap-2 transition-all shadow-lg ${
                    confirmAction === "deactivate"
                      ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400 shadow-red-600/20"
                      : "bg-green-600 hover:bg-green-700 disabled:bg-green-400 shadow-green-600/20"
                  }`}
                >
                  {confirmLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {confirmLoading
                    ? "Updating..."
                    : confirmAction === "activate"
                      ? "Activate"
                      : "Deactivate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
