import { createContext, useContext, useEffect, useState } from "react";
import { CurrentUser } from "../types/User";
import { Theme } from "../types/Common";
import { authService } from "../services/AuthService";

export interface AppContextType {
  user: CurrentUser | null;
  theme: Theme;
  setTheme: (t: Theme) => void;
  screen: string;
  setScreen: (s: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  requiresPasswordChange: boolean;
  setRequiresPasswordChange: (v: boolean) => void;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  theme: "light",
  setTheme: () => {},
  screen: "dashboard",
  setScreen: () => {},
  login: async () => {},
  logout: async () => {},
  isLoading: true,
  requiresPasswordChange: false,
  setRequiresPasswordChange: () => {},
});

export const useApp = () => useContext(AppContext);

async function restoreSession(): Promise<CurrentUser | null> {
  const storedUser = authService.getStoredUser();
  const accessToken = authService.getStoredAccessToken();

  if (!storedUser || !accessToken) {
    authService.clearTokens();
    return null;
  }

  try {
    const user = await authService.getCurrentUser();
    authService.saveUser(user);
    return user;
  } catch {
    authService.clearTokens();
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [theme, setThemeState] = useState<Theme>("light");
  const [screen, setScreen] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const login = async (email: string, password: string) => {
    const payload = await authService.login(email, password);
    authService.saveTokens(payload.accessToken, payload.refreshToken);
    if (payload.requiresPasswordChange) {
      authService.saveRequiresPasswordChange(true);
      setRequiresPasswordChange(true);
    }
    const currentUser = await authService.getCurrentUser();
    authService.saveUser(currentUser);
    setUser(currentUser);
    setScreen("dashboard");
  };

  const logout = async () => {
    const refreshToken = authService.getStoredRefreshToken();
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    authService.clearTokens();
    setUser(null);
    setRequiresPasswordChange(false);
    setScreen("dashboard");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    setRequiresPasswordChange(authService.getRequiresPasswordChange());
    restoreSession().then((restoredUser) => {
      if (mounted) {
        setUser(restoredUser);
        setIsLoading(false);
      }
    }).catch(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        theme,
        setTheme,
        screen,
        setScreen,
        login,
        logout,
        isLoading,
        requiresPasswordChange,
        setRequiresPasswordChange,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
