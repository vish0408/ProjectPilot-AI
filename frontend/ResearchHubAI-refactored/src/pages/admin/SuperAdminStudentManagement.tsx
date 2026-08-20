import { GraduationCap } from "lucide-react";
import SuperRoleManagement, { RoleManagementConfig } from "./SuperRoleManagement";

const config: RoleManagementConfig = {
  roleName: "Student",
  title: "Student Management",
  description: "Manage PhD Scholars across all colleges",
  idLabel: "Student ID",
  idField: "enrollment",
  statTotalLabel: "Total Students",
  badgeVariant: "outline",
  statIcon: GraduationCap,
  statColor: "bg-blue-500",
  showDepartment: true,
  showGuideFilter: true,
  showAssignedStudents: false,
  showResearchStatus: true,
  showGuideColumn: true,
  showScholarFields: true,
};

export default function SuperAdminStudentManagement() {
  return <SuperRoleManagement config={config} />;
}
