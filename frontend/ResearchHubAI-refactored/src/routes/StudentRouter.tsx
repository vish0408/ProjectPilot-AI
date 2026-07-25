import React, { Suspense } from "react";
import AccessDenied from "../components/common/AccessDenied";
import { useApp } from "../context/AppContext";
import { STUDENT_NAV } from "../utils/navigation";

const NotificationsScreen = React.lazy(() => import("../pages/shared/NotificationsScreen"));
const SettingsShared = React.lazy(() => import("../pages/shared/SettingsShared"));
const StudentAIAssistant = React.lazy(() => import("../pages/student/StudentAIAssistant"));
const StudentChapterVersions = React.lazy(() => import("../pages/student/StudentChapterVersions"));
const StudentDashboard = React.lazy(() => import("../pages/student/StudentDashboard"));
const StudentGuideComments = React.lazy(() => import("../pages/student/StudentGuideComments"));
const StudentLiterature = React.lazy(() => import("../pages/student/StudentLiterature"));
const LiteratureReviewPage = React.lazy(() => import("../pages/student/LiteratureReviewPage"));
const ResearchChatPage = React.lazy(() => import("../pages/student/ResearchChatPage"));
const ProposalGenerator = React.lazy(() => import("../pages/student/ProposalGenerator"));
const StudentMeetings = React.lazy(() => import("../pages/student/StudentMeetings"));
const StudentMyResearch = React.lazy(() => import("../pages/student/StudentMyResearch"));
const StudentProfile = React.lazy(() => import("../pages/student/StudentProfile"));
const StudentProgressTracker = React.lazy(() => import("../pages/student/StudentProgressTracker"));
const StudentResearchTimeline = React.lazy(() => import("../pages/student/StudentResearchTimeline"));
const StudentThesisUpload = React.lazy(() => import("../pages/student/StudentThesisUpload"));

export default function StudentRouter() {
  const { screen } = useApp();
  const allowed = STUDENT_NAV.map(n=>n.id);
  if(!allowed.includes(screen)) return <AccessDenied page={screen}/>;
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      {(() => {
        switch(screen) {
          case "dashboard": return <StudentDashboard/>;
          case "my-research": return <StudentMyResearch/>;
          case "research-timeline": return <StudentResearchTimeline/>;
          case "thesis-upload": return <StudentThesisUpload/>;
          case "chapter-versions": return <StudentChapterVersions/>;
          case "ai-assistant": return <StudentAIAssistant/>;
          case "proposal-generator": return <ProposalGenerator/>;
          case "literature": return <StudentLiterature/>;
          case "ai-literature-review": return <LiteratureReviewPage/>;
          case "research-chat": return <ResearchChatPage/>;
          case "meetings": return <StudentMeetings/>;
          case "guide-comments": return <StudentGuideComments/>;
          case "progress": return <StudentProgressTracker/>;
          case "notifications": return <NotificationsScreen/>;
          case "profile": return <StudentProfile/>;
          case "settings": return <SettingsShared role="student"/>;
          default: return <AccessDenied page={screen}/>;
        }
      })()}
    </Suspense>
  );
}
