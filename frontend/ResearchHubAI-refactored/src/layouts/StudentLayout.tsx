import StudentRouter from "../routes/StudentRouter";

/**
 * Layout wrapper for the Student role. AppShell renders the chrome
 * (Sidebar/Topbar); this component renders the role-specific routed content.
 */
export default function StudentLayout() {
  return <StudentRouter />;
}
