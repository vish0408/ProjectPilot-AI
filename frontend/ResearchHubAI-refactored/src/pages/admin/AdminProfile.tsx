import { User, Mail, Phone, IdCard, Shield } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { useApp } from "../../context/AppContext";

const roleLabel: Record<string, string> = {
  superadmin: "Super Admin",
  collegeadmin: "College Admin",
  guide: "Guide",
  student: "Student",
  hod: "HOD",
};

const roleBadgeVariant: Record<string, "danger" | "info" | "success" | "warning" | "purple"> = {
  superadmin: "danger",
  collegeadmin: "info",
  guide: "success",
  student: "warning",
  hod: "purple",
};

export default function AdminProfile() {
  const { user } = useApp();

  const fields = [
    { label: "Full Name", value: user?.name, icon: User },
    { label: "Email Address", value: user?.email, icon: Mail },
    { label: "Mobile Number", value: user?.phoneNumber, icon: Phone },
    { label: "Employee ID", value: user?.employeeId, icon: IdCard },
    { label: "Role", value: roleLabel[user?.role ?? ""] ?? user?.role, icon: Shield, isRole: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-bold">{user?.avatar}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-3">
              {user?.role && (
                <Badge className={`${user.role === "superadmin" ? "bg-red-600/80" : user.role === "collegeadmin" ? "bg-blue-600/80" : "bg-white/10"} text-white border-0`}>
                  {roleLabel[user.role] ?? user.role}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      <Card>
        <SectionHead title="Account Details"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {fields.map((f) => (
            <div key={f.label} className={f.label === "Role" ? "sm:col-span-2" : ""}>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </label>
              <p className="text-sm font-medium text-foreground mt-1">
                {f.value ? f.value : <span className="text-muted-foreground/60 italic">Not Available</span>}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
