"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { THEME_KEY as KEY } from "@/lib/theme";

type Theme = "light" | "dark";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the value the head script applied
    setTheme((document.documentElement.getAttribute("data-theme") as Theme) || "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    // Smooth cross-fade where the View Transitions API exists.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doc.startViewTransition(apply);
    } else apply();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border bg-card text-fg transition hover:border-accent/50 ${className}`}
    >
      <Sun
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
          theme === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
          theme === "light" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
}
