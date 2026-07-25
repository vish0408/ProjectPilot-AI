import React, { Suspense } from "react";
import AccessDenied from "../components/common/AccessDenied";
import { useApp } from "../context/AppContext";
import { HOD_NAV } from "../utils/navigation";

const HodAnnouncements = React.lazy(() => import("../pages/hod/HodAnnouncements"));
const HodDashboard = React.lazy(() => import("../pages/hod/HodDashboard"));
const HodGuides = React.lazy(() => import("../pages/hod/HodGuides"));
const HodProfile = React.lazy(() => import("../pages/hod/HodProfile"));
const HodReports = React.lazy(() => import("../pages/hod/HodReports"));
const HodResearchTopics = React.lazy(() => import("../pages/hod/HodResearchTopics"));
const HodStudents = React.lazy(() => import("../pages/hod/HodStudents"));
const HodAllocations = React.lazy(() => import("../pages/hod/HodAllocations"));
const HodProposals = React.lazy(() => import("../pages/hod/HodProposals"));
const HodMeetings = React.lazy(() => import("../pages/hod/HodMeetings"));
const HodProgress = React.lazy(() => import("../pages/hod/HodProgress"));
const NotificationsScreen = React.lazy(() => import("../pages/shared/NotificationsScreen"));

export default function HodRouter() {
  const { screen } = useApp();
  const allowed = HOD_NAV.map(n => n.id);
  if (!allowed.includes(screen)) return <AccessDenied page={screen} />;
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      {(() => {
        switch (screen) {
          case "dashboard": return <HodDashboard />;
          case "students": return <HodStudents />;
          case "guides": return <HodGuides />;
          case "allocations": return <HodAllocations />;
          case "research-topics": return <HodResearchTopics />;
          case "announcements": return <HodAnnouncements />;
          case "reports": return <HodReports />;
          case "proposals": return <HodProposals />;
          case "meetings": return <HodMeetings />;
          case "progress": return <HodProgress />;
          case "notifications": return <NotificationsScreen />;
          case "profile": return <HodProfile />;
          default: return <AccessDenied page={screen} />;
        }
      })()}
    </Suspense>
  );
}
