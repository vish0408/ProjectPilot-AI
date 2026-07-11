import AccessDenied from "../components/common/AccessDenied";
import { useApp } from "../context/AppContext";
import AdminAcademicYears from "../pages/admin/AdminAcademicYears";
import AdminAIConfig from "../pages/admin/AdminAIConfig";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AdminBackupRestore from "../pages/admin/AdminBackupRestore";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminDepartmentMgmt from "../pages/admin/AdminDepartmentMgmt";
import AdminFaculties from "../pages/admin/AdminFaculties";
import AdminGlobalAnnouncements from "../pages/admin/AdminGlobalAnnouncements";
import AdminGuideManagement from "../pages/admin/AdminGuideManagement";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminResearchTopics from "../pages/admin/AdminResearchTopics";
import AdminRolesPermissions from "../pages/admin/AdminRolesPermissions";
import AdminSemesters from "../pages/admin/AdminSemesters";
import AdminStudentManagement from "../pages/admin/AdminStudentManagement";
import AdminSystemSettings from "../pages/admin/AdminSystemSettings";
import AdminUniversityMgmt from "../pages/admin/AdminUniversityMgmt";
import AdminUserManagement from "../pages/admin/AdminUserManagement";
import NotificationsScreen from "../pages/shared/NotificationsScreen";
import { ADMIN_NAV } from "../utils/navigation";

export default function AdminRouter() {
  const { screen } = useApp();
  const allowed = ADMIN_NAV.map(n=>n.id);
  if(!allowed.includes(screen)) return <AccessDenied page={screen}/>;
  switch(screen) {
    case "dashboard": return <AdminDashboard/>;
    case "user-management": return <AdminUserManagement/>;
    case "student-management": return <AdminStudentManagement/>;
    case "guide-management": return <AdminGuideManagement/>;
    case "department-mgmt": return <AdminDepartmentMgmt/>;
    case "university-mgmt": return <AdminUniversityMgmt/>;
    case "research-topics": return <AdminResearchTopics/>;
    case "ai-config": return <AdminAIConfig/>;
    case "analytics": return <AdminAnalytics/>;
    case "audit-logs": return <AdminAuditLogs/>;
    case "backup-restore": return <AdminBackupRestore/>;
    case "system-settings": return <AdminSystemSettings/>;
    case "roles-permissions": return <AdminRolesPermissions/>;
    case "academic-years":      return <AdminAcademicYears/>;
    case "semesters":           return <AdminSemesters/>;
    case "faculties":           return <AdminFaculties/>;
    case "global-announcements": return <AdminGlobalAnnouncements/>;
    case "notifications": return <NotificationsScreen items={[]} />;
    case "profile": return <AdminProfile/>;
    default: return <AccessDenied page={screen}/>;
  }
}
