import { useEffect, useState } from "react";
import { X, Mail, Phone, Building, Calendar, Shield, Hash, MapPin, Activity, UserCheck, Loader2, BadgeCheck, Clock, BookOpen, GraduationCap } from "lucide-react";
import Badge from "../common/Badge";
import AccountStatusBadge from "../common/AccountStatusBadge";
import ProgressBar from "../common/ProgressBar";
import { hodService } from "../../services/HodService";
import type { StudentDetail } from "../../types/Hod";

interface HodStudentViewDrawerProps {
  open: boolean;
  studentUserId: string | null;
  onClose: () => void;
}

function fmtDate(d?: string | null) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); } catch { return d; }
}

function fmtMonth(d?: string | null) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }); } catch { return d; }
}

function Cell({ label, value, icon: Icon, span = false }: { label: string; value?: string | number | null; icon?: React.ComponentType<{ className?: string }>; span?: boolean }) {
  return (
    <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 ${span ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="w-3 h-3 text-slate-400 flex-shrink-0" />}
        <p className="text-[10px] text-slate-500 truncate">{label}</p>
      </div>
      <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={value ? String(value) : undefined}>{value || "—"}</p>
    </div>
  );
}

export default function HodStudentViewDrawer({ open, studentUserId, onClose }: HodStudentViewDrawerProps) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && studentUserId) {
      setLoading(true);
      hodService.getStudentDetail(studentUserId)
        .then(setStudent)
        .catch(() => setStudent(null))
        .finally(() => setLoading(false));
    } else {
      setStudent(null);
    }
  }, [open, studentUserId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }
  }, [open, onClose]);

  if (!open) return null;

  const initials = student?.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl sm:border-l border-white/10 animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Student Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors touch-target">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : !student ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Student not found</div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 w-full">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{student.fullName}</h3>
                <p className="text-xs sm:text-sm text-slate-500 truncate" title={student.email}>{student.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Badge variant="outline">Student</Badge>
                <AccountStatusBadge status={student.accountStatus} />
                {student.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={student.email}>{student.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={student.phoneNumber}>{student.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Identity</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Student ID / Enrollment" value={student.enrollment || student.employeeId} icon={Hash} />
                <Cell label="Employee ID" value={student.employeeId} icon={Hash} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Department" value={student.departmentName || student.department} icon={Building} />
                <Cell label="College" value={student.collegeName || student.college} icon={MapPin} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Joining Cohort" value={fmtMonth(student.joiningCohort)} icon={Calendar} />
                <Cell label="Registration Date" value={fmtDate(student.registrationDate)} icon={Calendar} />
                <Cell label="PhD Mode" value={student.phdMode} icon={GraduationCap} />
                <Cell label="Research Stage" value={student.researchStageName} icon={BookOpen} />
                <Cell label="Guide" value={student.guideName} icon={UserCheck} />
                <Cell label="Guide Employee ID" value={student.guideEmployeeId} icon={Hash} />
                <Cell label="Research Topic" value={student.researchTopic} icon={BookOpen} span />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coursework & Credits</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Required Credits" value={student.requiredCredits != null ? `${student.requiredCredits}` : null} icon={Shield} />
                <Cell label="Earned Credits" value={student.earnedCredits != null ? `${student.earnedCredits}` : null} icon={Shield} />
                <Cell label="Passed Papers" value={student.passedPapers != null ? `${student.passedPapers}` : null} icon={Shield} />
                <Cell label="Pending Papers" value={student.pendingPapers != null ? `${student.pendingPapers}` : null} icon={Shield} />
                <Cell label="Coursework Status" value={student.courseworkStatus} icon={Activity} span />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project</h4>
              {student.projectTitle ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500 truncate">Project Title</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{student.projectTitle}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1"><ProgressBar value={student.completionPercentage} /></div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{student.completionPercentage}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">{student.projectStatus || "No Project"}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No project assigned</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Created" value={fmtDate(student.createdAt)} icon={Calendar} />
                <Cell label="Last Login" value={fmtDate(student.lastLoginAt)} icon={Clock} />
                <Cell label="Email Verified" value={student.emailVerified ? "Yes" : "No"} icon={BadgeCheck} />
                <Cell label="Account Status" value={student.accountStatus} icon={Activity} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
