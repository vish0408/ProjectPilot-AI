import { UserCheck } from "lucide-react";
import SuperRoleManagement, { RoleManagementConfig } from "./SuperRoleManagement";

const config: RoleManagementConfig = {
  roleName: "Guide",
  title: "Guide Management",
  description: "Manage Research Guides across all colleges",
  idLabel: "Employee ID",
  idField: "employeeId",
  statTotalLabel: "Total Guides",
  badgeVariant: "success",
  statIcon: UserCheck,
  statColor: "bg-indigo-500",
  showDepartment: true,
  showGuideFilter: false,
  showAssignedStudents: true,
  showResearchStatus: false,
  showGuideColumn: false,
};

export default function AdminGuideManagement() {
  return <SuperRoleManagement config={config} />;
}