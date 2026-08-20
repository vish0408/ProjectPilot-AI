import { useEffect, useState } from "react";
import { X, Mail, Phone, Building, Calendar, Shield, Hash, MapPin, Activity, UserCheck, Loader2, BadgeCheck, Clock, BookOpen, Users } from "lucide-react";
import Badge from "../common/Badge";
import AccountStatusBadge from "../common/AccountStatusBadge";
import ProgressBar from "../common/ProgressBar";
import { hodService } from "../../services/HodService";
import type { GuideDetail } from "../../types/Hod";

interface HodGuideViewDrawerProps {
  open: boolean;
  guideUserId: string | null;
  onClose: () => void;
}

function fmtDate(d?: string | null) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); } catch { return d; }
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

export default function HodGuideViewDrawer({ open, guideUserId, onClose }: HodGuideViewDrawerProps) {
  const [guide, setGuide] = useState<GuideDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && guideUserId) {
      setLoading(true);
      hodService.getGuideDetail(guideUserId)
        .then(setGuide)
        .catch(() => setGuide(null))
        .finally(() => setLoading(false));
    } else {
      setGuide(null);
    }
  }, [open, guideUserId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }
  }, [open, onClose]);

  if (!open) return null;

  const initials = guide?.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl sm:border-l border-white/10 animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Guide Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors touch-target">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : !guide ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Guide not found</div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 w-full">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{guide.fullName}</h3>
                <p className="text-xs sm:text-sm text-slate-500 truncate" title={guide.email}>{guide.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Badge variant="success">Guide</Badge>
                <AccountStatusBadge status={guide.accountStatus} />
                {guide.isAvailable ? <Badge variant="success">Available</Badge> : <Badge variant="danger">Busy</Badge>}
                {guide.emailVerified && (
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
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={guide.email}>{guide.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={guide.phoneNumber}>{guide.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Identity</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Employee ID" value={guide.employeeId} icon={Hash} />
                <Cell label="Designation" value={guide.designation} icon={Shield} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Department" value={guide.departmentName || guide.department} icon={Building} />
                <Cell label="College" value={guide.collegeName || guide.college} icon={MapPin} />
                <Cell label="Specialization" value={guide.specialization} icon={BookOpen} span />
                {guide.institution && <Cell label="Institution" value={guide.institution} icon={Building} span />}
              </div>
            </div>

            {guide.bio && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bio</h4>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{guide.bio}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workload</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Assigned Scholars" value={guide.assignedStudents} icon={Users} />
                <Cell label="Max Capacity" value={guide.maxCapacity} icon={Users} />
                <Cell label="Active Projects" value={guide.activeProjects} icon={BookOpen} />
                <Cell label="Completed Projects" value={guide.completedProjects} icon={BookOpen} />
                <Cell label="Pending Reviews" value={guide.pendingReviews} icon={Activity} />
              </div>
            </div>

            {guide.students?.length ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guided Scholars ({guide.students.length})</h4>
                <div className="flex flex-col gap-2">
                  {guide.students.map((s) => (
                    <div key={s.userId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.fullName}</p>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{s.completionPercentage}%</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] text-slate-500 truncate" title={s.email}>{s.enrollment ? `${s.enrollment} · ${s.email}` : s.email}</p>
                        <p className="text-[11px] text-slate-500 truncate" title={s.researchTopic || "No topic"}>{s.researchTopic || "No topic"}</p>
                        <p className="text-[11px] text-slate-500">{s.researchStageName ? `${s.researchStageName} · ` : ""}{s.projectStatus}</p>
                      </div>
                      <div className="mt-1.5"><ProgressBar value={s.completionPercentage} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</h4>
              <div className="grid grid-cols-2 gap-2">
                <Cell label="Created" value={fmtDate(guide.createdAt)} icon={Calendar} />
                <Cell label="Last Login" value={fmtDate(guide.lastLoginAt)} icon={Clock} />
                <Cell label="Email Verified" value={guide.emailVerified ? "Yes" : "No"} icon={BadgeCheck} />
                <Cell label="Account Status" value={guide.accountStatus} icon={Activity} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
