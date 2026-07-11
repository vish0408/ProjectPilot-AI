import { useApp } from "../context/AppContext";

/** Convenience hook exposing just the theme slice of AppContext. */
export function useTheme() {
  const { theme, setTheme } = useApp();
  return { theme, setTheme, toggleTheme: () => setTheme(theme === "light" ? "dark" : "light") };
}
