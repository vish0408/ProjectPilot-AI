import AccessDenied from "../components/common/AccessDenied";
import { useApp } from "../context/AppContext";
import NotificationsScreen from "../pages/shared/NotificationsScreen";
import SettingsShared from "../pages/shared/SettingsShared";
import StudentAIAssistant from "../pages/student/StudentAIAssistant";
import StudentChapterVersions from "../pages/student/StudentChapterVersions";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentGuideComments from "../pages/student/StudentGuideComments";
import StudentLiterature from "../pages/student/StudentLiterature";
import ProposalGenerator from "../pages/student/ProposalGenerator";
import StudentMeetings from "../pages/student/StudentMeetings";
import StudentMyResearch from "../pages/student/StudentMyResearch";
import StudentProfile from "../pages/student/StudentProfile";
import StudentProgressTracker from "../pages/student/StudentProgressTracker";
import StudentResearchTimeline from "../pages/student/StudentResearchTimeline";
import StudentThesisUpload from "../pages/student/StudentThesisUpload";
import { STUDENT_NAV } from "../utils/navigation";

export default function StudentRouter() {
  const { screen } = useApp();
  const allowed = STUDENT_NAV.map(n=>n.id);
  if(!allowed.includes(screen)) return <AccessDenied page={screen}/>;
  switch(screen) {
    case "dashboard": return <StudentDashboard/>;
    case "my-research": return <StudentMyResearch/>;
    case "research-timeline": return <StudentResearchTimeline/>;
    case "thesis-upload": return <StudentThesisUpload/>;
    case "chapter-versions": return <StudentChapterVersions/>;
    case "ai-assistant": return <StudentAIAssistant/>;
    case "proposal-generator": return <ProposalGenerator/>;
    case "literature": return <StudentLiterature/>;
    case "meetings": return <StudentMeetings/>;
    case "guide-comments": return <StudentGuideComments/>;
    case "progress": return <StudentProgressTracker/>;
    case "notifications": return <NotificationsScreen/>;
    case "profile": return <StudentProfile/>;
    case "settings": return <SettingsShared role="student"/>;
    default: return <AccessDenied page={screen}/>;
  }
}
