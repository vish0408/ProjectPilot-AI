import { CurrentUser } from "./User";

export type Theme = "light" | "dark";

export interface AppContextType {
  user: CurrentUser | null;
  theme: Theme;
  setTheme: (t: Theme) => void;
  screen: string;
  setScreen: (s: string) => void;
  logout: () => void;
}

/** Chat message shape used by the AI assistant / AI review chat widgets. */
export type Msg = { role: "user" | "assistant"; text: string; time: string };
