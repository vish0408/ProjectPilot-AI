import React, { Suspense } from "react";
import AccessDenied from "../components/common/AccessDenied";
import { useApp } from "../context/AppContext";
import { GUIDE_NAV } from "../utils/navigation";

const GuideAIReview = React.lazy(() => import("../pages/guide/GuideAIReview"));
const GuideAssignedStudents = React.lazy(() => import("../pages/guide/GuideAssignedStudents"));
const GuideDashboard = React.lazy(() => import("../pages/guide/GuideDashboard"));
const GuideMeetingScheduler = React.lazy(() => import("../pages/guide/GuideMeetingScheduler"));
const GuidePendingApprovals = React.lazy(() => import("../pages/guide/GuidePendingApprovals"));
const GuideProfile = React.lazy(() => import("../pages/guide/GuideProfile"));
const GuideReports = React.lazy(() => import("../pages/guide/GuideReports"));
const GuideResearchProgress = React.lazy(() => import("../pages/guide/GuideResearchProgress"));
const GuideThesisReviews = React.lazy(() => import("../pages/guide/GuideThesisReviews"));
const NotificationsScreen = React.lazy(() => import("../pages/shared/NotificationsScreen"));
const SettingsShared = React.lazy(() => import("../pages/shared/SettingsShared"));

export default function GuideRouter() {
  const { screen } = useApp();
  const allowed = GUIDE_NAV.map(n=>n.id);
  if(!allowed.includes(screen)) return <AccessDenied page={screen}/>;
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      {(() => {
        switch(screen) {
          case "dashboard": return <GuideDashboard/>;
          case "assigned-students": return <GuideAssignedStudents/>;
          case "thesis-reviews": return <GuideThesisReviews/>;
          case "pending-approvals": return <GuidePendingApprovals/>;
          case "ai-review": return <GuideAIReview/>;
          case "meeting-scheduler": case "guide-calendar": return <GuideMeetingScheduler/>;
          case "research-progress": return <GuideResearchProgress/>;
          case "notifications": return <NotificationsScreen/>;
          case "reports": return <GuideReports/>;
          case "profile": return <GuideProfile/>;
          case "settings": return <SettingsShared role="guide"/>;
          default: return <AccessDenied page={screen}/>;
        }
      })()}
    </Suspense>
  );
}
