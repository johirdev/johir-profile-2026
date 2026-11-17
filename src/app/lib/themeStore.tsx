"use client";

import { useEffect } from "react";
import { useThemeStore, THEME_STORAGE_KEY, type Theme } from "./store";

/**
 * Runs before first paint, inlined in <head>. Keeping it as a string keeps
 * it out of the React tree so there is no hydration mismatch, and no flash
 * of the wrong theme on a hard refresh.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY
)};var s=localStorage.getItem(k);var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useThemeStore((state) => state.theme);
  const hydrate = useThemeStore((state) => state.hydrate);

  // Reconcile the store with whatever the bootstrap script already applied.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Keep the attribute in sync if the store is changed from anywhere else.
  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-theme") !== theme) {
      root.setAttribute("data-theme", theme);
      root.style.colorScheme = theme;
    }
  }, [theme]);

  // Mirror the theme across tabs.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      if (event.newValue === "light" || event.newValue === "dark") {
        useThemeStore.getState().setTheme(event.newValue as Theme);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Follow the OS while the visitor has not chosen a theme themselves.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: light)");

    const onChange = (event: MediaQueryListEvent) => {
      const state = useThemeStore.getState();
      if (state.explicit) return;
      const next: Theme = event.matches ? "light" : "dark";
      if (state.theme !== next) {
        useThemeStore.setState({ theme: next });
      }
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return <>{children}</>;
}
