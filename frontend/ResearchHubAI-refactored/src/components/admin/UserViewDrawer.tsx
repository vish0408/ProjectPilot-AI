import { useEffect, useRef, useState } from "react";
import { X, Mail, Phone, Building, Calendar, Shield, Hash, MapPin, Activity, UserCheck, Loader2, BadgeCheck, Clock } from "lucide-react";
import Badge from "../common/Badge";
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

  const statusColor = (status?: string) => {
    if (!status) return "outline" as const;
    const s = status.toLowerCase();
    if (s === "active") return "success" as const;
    if (s === "draft") return "outline" as const;
    if (s === "invitationsent" || s === "invitation sent") return "warning" as const;
    if (s === "emailverified" || s === "email verified") return "info" as const;
    if (s === "locked" || s === "disabled") return "danger" as const;
    return "outline" as const;
  };

  const initials = user?.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl border-l border-white/10 animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">User not found</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.fullName}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Badge variant={roleColor(user.roleName)}>{user.roleName}</Badge>
                <Badge variant={statusColor(user.accountStatus)}>{user.accountStatus || (user.isActive ? "Active" : "Inactive")}</Badge>
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
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Identity</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">Employee / Student ID</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.employeeId || "-"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">Role</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.roleName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">Department</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.department || "-"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">College</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.college || "-"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">Designation</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.designation || "-"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">Created</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">Account Status</p>
                  </div>
                  <Badge variant={statusColor(user.accountStatus)}>{user.accountStatus || (user.isActive ? "Active" : "Inactive")}</Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BadgeCheck className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">Email Verified</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.emailVerified ? "Yes" : "No"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] text-slate-500">Last Login</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
