import AccessDenied from "../components/common/AccessDenied";
import { useApp } from "../context/AppContext";
import HodAnnouncements from "../pages/hod/HodAnnouncements";
import HodDashboard from "../pages/hod/HodDashboard";
import HodGuides from "../pages/hod/HodGuides";
import HodProfile from "../pages/hod/HodProfile";
import HodReports from "../pages/hod/HodReports";
import HodResearchTopics from "../pages/hod/HodResearchTopics";
import HodStudents from "../pages/hod/HodStudents";
import HodAllocations from "../pages/hod/HodAllocations";
import NotificationsScreen from "../pages/shared/NotificationsScreen";
import { HOD_NAV } from "../utils/navigation";

export default function HodRouter() {
  const { screen } = useApp();
  const allowed = HOD_NAV.map(n => n.id);
  if (!allowed.includes(screen)) return <AccessDenied page={screen} />;
  switch (screen) {
    case "dashboard": return <HodDashboard />;
    case "students": return <HodStudents />;
    case "guides": return <HodGuides />;
    case "allocations": return <HodAllocations />;
    case "research-topics": return <HodResearchTopics />;
    case "announcements": return <HodAnnouncements />;
    case "reports": return <HodReports />;
    case "notifications": return <NotificationsScreen />;
    case "profile": return <HodProfile />;
    default: return <AccessDenied page={screen} />;
  }
}
