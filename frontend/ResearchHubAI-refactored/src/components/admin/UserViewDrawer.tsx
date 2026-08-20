import { useEffect, useRef, useState } from "react";
import { X, Mail, Phone, Building, Calendar, Shield, Hash, MapPin, Activity, UserCheck, Loader2, BadgeCheck, Clock } from "lucide-react";
import Badge from "../common/Badge";
import AccountStatusBadge from "../common/AccountStatusBadge";
import CourseworkManager from "./CourseworkManager";
import { adminService } from "../../services/AdminService";
import type { UserResponse } from "../../types/Admin";

interface UserViewDrawerProps {
  open: boolean;
  userId: string | null;
  user: UserResponse | null;
  onClose: () => void;
}

export default function UserViewDrawer({ open, userId, user: initialUser, onClose }: UserViewDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [liveUser, setLiveUser] = useState<UserResponse | null>(initialUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      adminService.getUser(userId)
        .then(setLiveUser)
        .catch(() => setLiveUser(initialUser))
        .finally(() => setLoading(false));
    } else {
      setLiveUser(initialUser);
    }
  }, [open, userId, initialUser]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }
  }, [open, onClose]);

  if (!open) return null;

  const user = liveUser;

  const roleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === "collegeadmin" || r === "super admin") return "info" as const;
    if (r === "hod") return "purple" as const;
    if (r === "guide") return "success" as const;
    return "outline" as const;
  };

  const initials = user?.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl sm:border-l border-white/10 animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">User Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors touch-target">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">User not found</div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{user.fullName}</h3>
                <p className="text-xs sm:text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Badge variant={roleColor(user.roleName)}>{user.roleName}</Badge>
                <AccountStatusBadge status={user.accountStatus} />
                {user.emailVerified && (
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
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Identity</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Employee / Student ID</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.employeeId || "Not assigned"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Role</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.roleName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Department</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.department || "Not assigned"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">College</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.college || "Not assigned"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <UserCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Designation</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.designation || "Not assigned"}</p>
                </div>
              </div>
            </div>

            {(() => {
              const r = user.roleName.toLowerCase();
              const cells: { label: string; value?: string | number | null }[] = [];
              if (r === "student") {
                cells.push({ label: "Roll Number", value: user.employeeId });
                cells.push({ label: "Enrollment", value: user.enrollment || user.employeeId });
                cells.push({ label: "Joining Cohort", value: user.joiningCohort ? new Date(user.joiningCohort).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null });
                cells.push({ label: "Registration Date", value: user.registrationDate ? new Date(user.registrationDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null });
                cells.push({ label: "PhD Mode", value: user.phdMode });
                cells.push({ label: "Required Credits", value: user.requiredCredits != null ? `${user.requiredCredits}` : null });
                cells.push({ label: "Research Stage", value: user.researchStageName });
                cells.push({ label: "Coursework Status", value: user.courseworkStatus });
                cells.push({ label: "Earned Credits", value: user.earnedCredits != null ? `${user.earnedCredits}` : null });
                cells.push({ label: "Passed Papers", value: user.passedPapers != null ? `${user.passedPapers}` : null });
                cells.push({ label: "Pending Papers", value: user.pendingPapers != null ? `${user.pendingPapers}` : null });
                cells.push({ label: "Research Topic", value: user.researchTopic });
                cells.push({ label: "Guide", value: user.guideName });
              } else if (r === "guide") {
                cells.push({ label: "Specialization", value: user.specialization });
              } else if (r === "hod") {
                cells.push({ label: "Qualification", value: user.qualification });
                cells.push({ label: "Years of Experience", value: user.yearsOfExperience != null ? `${user.yearsOfExperience} yrs` : null });
              }
              if (!cells.length) return null;
              return (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cells.map((c) => (
                      <div key={c.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-500 truncate">{c.label}</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.value || "Not assigned"}</p>
                      </div>
                    ))}
                    {r === "guide" && user.bio && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 col-span-2">
                        <p className="text-[10px] text-slate-500 truncate">Bio</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {user.roleName.toLowerCase() === "student" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coursework & Credits</h4>
                <CourseworkManager studentUserId={user.id} />
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Created</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Account Status</p>
                  </div>
                  <AccountStatusBadge status={user.accountStatus} />
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BadgeCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Email Verified</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.emailVerified ? "Yes" : "No"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Last Login</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 truncate">Updated</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Not assigned"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
