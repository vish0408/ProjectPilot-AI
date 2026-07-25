import React, { Suspense } from "react";
import AccessDenied from "../components/common/AccessDenied";
import { useApp } from "../context/AppContext";
import { SUPER_ADMIN_NAV, COLLEGE_ADMIN_NAV } from "../utils/navigation";

const AdminAcademicYears = React.lazy(() => import("../pages/admin/AdminAcademicYears"));
const AdminAIConfig = React.lazy(() => import("../pages/admin/AdminAIConfig"));
const AIPlayground = React.lazy(() => import("../pages/admin/AIPlayground"));
const AdminAnalytics = React.lazy(() => import("../pages/admin/AdminAnalytics"));
const AdminAuditLogs = React.lazy(() => import("../pages/admin/AdminAuditLogs"));
const AdminBackupRestore = React.lazy(() => import("../pages/admin/AdminBackupRestore"));
const AdminDashboard = React.lazy(() => import("../pages/admin/AdminDashboard"));
const AdminDepartmentMgmt = React.lazy(() => import("../pages/admin/AdminDepartmentMgmt"));
const AdminHodManagement = React.lazy(() => import("../pages/admin/AdminHodManagement"));
const AdminFaculties = React.lazy(() => import("../pages/admin/AdminFaculties"));
const AdminGlobalAnnouncements = React.lazy(() => import("../pages/admin/AdminGlobalAnnouncements"));
const AdminGuideManagement = React.lazy(() => import("../pages/admin/AdminGuideManagement"));
const AdminProfile = React.lazy(() => import("../pages/admin/AdminProfile"));
const AdminResearchTopics = React.lazy(() => import("../pages/admin/AdminResearchTopics"));
const AdminRolesPermissions = React.lazy(() => import("../pages/admin/AdminRolesPermissions"));
const AdminSemesters = React.lazy(() => import("../pages/admin/AdminSemesters"));
const AdminStudentManagement = React.lazy(() => import("../pages/admin/AdminStudentManagement"));
const AdminSystemSettings = React.lazy(() => import("../pages/admin/AdminSystemSettings"));
const AdminUniversityMgmt = React.lazy(() => import("../pages/admin/AdminUniversityMgmt"));
const AdminUserManagement = React.lazy(() => import("../pages/admin/AdminUserManagement"));
const NotificationsScreen = React.lazy(() => import("../pages/shared/NotificationsScreen"));

export default function AdminRouter() {
  const { screen, user } = useApp();
  const isSuperAdmin = user?.role === "superadmin";
  const allowedNav = isSuperAdmin ? SUPER_ADMIN_NAV : COLLEGE_ADMIN_NAV;
  const allowed = allowedNav.map(n=>n.id);
  if(!allowed.includes(screen)) return <AccessDenied page={screen}/>;
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      {(() => {
        switch(screen) {
          case "dashboard": return <AdminDashboard/>;
          case "user-management": return <AdminUserManagement/>;
          case "student-management": return <AdminStudentManagement/>;
          case "guide-management": return <AdminGuideManagement/>;
          case "department-mgmt": return <AdminDepartmentMgmt/>;
          case "hod-mgmt":        return <AdminHodManagement/>;
          case "university-mgmt": return <AdminUniversityMgmt/>;
          case "research-topics": return <AdminResearchTopics/>;
          case "ai-playground": return <AIPlayground/>;
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
          case "notifications": return <NotificationsScreen />;
          case "profile": return <AdminProfile/>;
          default: return <AccessDenied page={screen}/>;
        }
      })()}
    </Suspense>
  );
}
