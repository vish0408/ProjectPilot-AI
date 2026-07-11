import { AppProvider } from "../context/AppContext";
import AppRoutes from "../routes/AppRoutes";

/**
 * Composition root for ResearchHub AI.
 *
 * Responsibilities (and nothing else — see TASK 3):
 *  - Initialize the global AppProvider (auth + theme + screen context)
 *  - Render AppRoutes, which decides between the Auth flow (Login) and
 *    the authenticated AppShell based on context state
 *
 * All business logic, layout, and page rendering lives in
 * context/, layouts/, routes/, and pages/.
 */
export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
