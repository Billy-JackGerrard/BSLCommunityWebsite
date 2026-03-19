import { useState, useEffect, useCallback } from "react";

export type ThemeName = "classic" | "ocean" | "ember";

const THEMES: ThemeName[] = ["classic", "ocean", "ember"];
export type ColorMode = "auto" | "light" | "dark";

const THEME_KEY = "bsl-theme";
const MODE_KEY = "bsl-color-mode";

function getStoredTheme(): ThemeName {
  return (localStorage.getItem(THEME_KEY) as ThemeName) || "classic";
}

function getStoredMode(): ColorMode {
  return (localStorage.getItem(MODE_KEY) as ColorMode) || "auto";
}

function applyDark(mode: ColorMode) {
  const isDark =
    mode === "dark" ||
    (mode === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.toggleAttribute("data-dark", isDark);
}

function applyTheme(theme: ThemeName) {
  if (theme === "classic") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(getStoredTheme);
  const [colorMode, setColorModeState] = useState<ColorMode>(getStoredMode);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    applyDark(colorMode);
    localStorage.setItem(MODE_KEY, colorMode);
  }, [colorMode]);

  // Listen for OS dark mode changes when in "auto" mode
  useEffect(() => {
    if (colorMode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyDark("auto");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [colorMode]);

  const setTheme = useCallback((t: ThemeName) => setThemeState(t), []);
  const setColorMode = useCallback((m: ColorMode) => setColorModeState(m), []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  }, []);

  return { theme, colorMode, setTheme, setColorMode, toggleTheme };
}
