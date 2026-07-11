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

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const login = async (email: string, password: string) => {
    const payload = await authService.login(email, password);
    authService.saveTokens(payload.accessToken, payload.refreshToken);
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
    setScreen("dashboard");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    restoreSession().then((restoredUser) => {
      setUser(restoredUser);
      setIsLoading(false);
    });
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
