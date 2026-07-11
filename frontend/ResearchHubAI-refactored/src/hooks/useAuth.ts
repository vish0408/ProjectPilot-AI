import { useApp } from "../context/AppContext";

export function useAuth() {
  const { user, login, logout, isLoading } = useApp();
  return { user, isAuthenticated: !!user, login, logout, isLoading };
}
