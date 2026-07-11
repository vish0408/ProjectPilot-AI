import { useApp } from "../context/AppContext";
import ProtectedRoute from "./ProtectedRoute";
import AppShell from "../layouts/AppShell";

/**
 * Top-level route composition. ResearchHub AI uses in-app "screen" state
 * rather than URL-based routing (no deep-linking requirement), so this
 * component's job is simply: require auth, then hand off to AppShell,
 * which in turn delegates to the role-specific layout/router.
 */
export default function AppRoutes() {
  const { user } = useApp();
  return (
    <ProtectedRoute>
      {user && <AppShell user={user} />}
    </ProtectedRoute>
  );
}
