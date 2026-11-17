import { create } from "zustand";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * The theme is expressed as `data-theme` on <html>, which is what
 * globals.css keys every design token off. The same attribute is written
 * by the inline bootstrap script in the root layout before first paint,
 * so there is never a flash of the wrong theme.
 */
export const applyTheme = (theme: Theme, { persist = true } = {}) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;

  // Only an explicit choice is stored. Persisting on hydrate would freeze
  // whatever the OS happened to say on the first visit, and the site would
  // then ignore the visitor changing their system theme later.
  if (!persist) return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private browsing / storage disabled — the attribute above still applies.
  }
};

export const readStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
};

export const prefersDark = (): boolean => {
  if (typeof window === "undefined") return true;
  return !window.matchMedia("(prefers-color-scheme: light)").matches;
};

interface ThemeState {
  theme: Theme;
  /** False until the client store has reconciled with localStorage. */
  hydrated: boolean;
  /** True once the visitor has picked a theme themselves. */
  explicit: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  hydrate: () => void;
}

/**
 * The server always renders "dark" so markup is deterministic; `hydrate()`
 * runs once on mount and swaps in the visitor's stored or OS preference.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  hydrated: false,
  explicit: false,

  hydrate: () => {
    if (get().hydrated) return;

    const stored = readStoredTheme();
    const theme = stored ?? (prefersDark() ? "dark" : "light");

    set({ theme, hydrated: true, explicit: stored !== null });
    applyTheme(theme, { persist: false });
  },

  toggleTheme: () => {
    const next: Theme = get().theme === "light" ? "dark" : "light";
    set({ theme: next, explicit: true });
    applyTheme(next);
  },

  setTheme: (theme) => {
    set({ theme, explicit: true });
    applyTheme(theme);
  },
}));
