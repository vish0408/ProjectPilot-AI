import { useApp } from "../context/AppContext";
import AccessDenied from "../components/common/AccessDenied";
import { Role } from "../types/Role";

/**
 * Gates its children behind one or more allowed roles. Used by the
 * per-role routers (StudentRouter/GuideRouter/AdminRouter) which already
 * check nav-item membership; this component is the reusable primitive
 * for future role-based gating (e.g. individual actions within a page).
 */
export default function RoleRoute({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, screen } = useApp();
  if (!user || !allow.includes(user.role)) {
    return <AccessDenied page={screen} />;
  }
  return <>{children}</>;
}
