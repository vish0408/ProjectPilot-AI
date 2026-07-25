import { useApp } from "../context/AppContext";
import AuthLayout from "../layouts/AuthLayout";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, requiresPasswordChange, setRequiresPasswordChange } = useApp();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthLayout />;

  if (window.location.pathname === "/activate" || window.location.pathname.startsWith("/reset-password") || window.location.pathname.startsWith("/forgot-password")) return <AuthLayout />;

  if (requiresPasswordChange) {
    return (
      <ChangePasswordPage
        onSuccess={() => {
          setRequiresPasswordChange(false);
        }}
      />
    );
  }

  return <>{children}</>;
}
