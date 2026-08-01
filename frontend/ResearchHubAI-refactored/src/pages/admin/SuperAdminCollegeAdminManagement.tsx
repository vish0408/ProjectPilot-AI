import { UserCog } from "lucide-react";
import SuperRoleManagement, { RoleManagementConfig } from "./SuperRoleManagement";

const config: RoleManagementConfig = {
  roleName: "CollegeAdmin",
  title: "College Admin Management",
  description: "Manage College Admin accounts across all colleges",
  idLabel: "Employee ID",
  idField: "employeeId",
  statTotalLabel: "Total College Admins",
  badgeVariant: "info",
  statIcon: UserCog,
  statColor: "bg-slate-600",
  showDepartment: false,
  showGuideFilter: false,
  showAssignedStudents: false,
  showResearchStatus: false,
  showGuideColumn: false,
};

export default function SuperAdminCollegeAdminManagement() {
  return <SuperRoleManagement config={config} />;
}
