import { useState, useEffect } from "react";

export type ColorTheme = "violet" | "blue" | "teal" | "rose" | "amber" | "green";
export type AppearanceMode = "light" | "dark" | "system";

export interface ThemeSettings {
  colorTheme: ColorTheme;
  appearance: AppearanceMode;
}

export const COLOR_THEMES: { key: ColorTheme; label: string; primary: string; accent: string }[] = [
  { key: "violet", label: "Violet",  primary: "249 93% 60%", accent: "280 83% 65%" },
  { key: "blue",   label: "Blue",    primary: "217 91% 60%", accent: "199 89% 48%" },
  { key: "teal",   label: "Teal",    primary: "187 85% 40%", accent: "160 84% 39%" },
  { key: "rose",   label: "Rose",    primary: "346 84% 61%", accent: "316 73% 52%" },
  { key: "amber",  label: "Amber",   primary: "38 92% 50%",  accent: "25 95% 53%"  },
  { key: "green",  label: "Green",   primary: "142 71% 40%", accent: "161 84% 39%" },
];

const STORAGE_KEY = "scanflow-theme";

function getInitialSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { colorTheme: "violet", appearance: "system" };
}

function applyColorTheme(colorTheme: ColorTheme) {
  const theme = COLOR_THEMES.find(t => t.key === colorTheme) ?? COLOR_THEMES[0];
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--ring", theme.primary);
  root.style.setProperty("--accent", theme.accent);
}

function applyAppearance(appearance: AppearanceMode) {
  const root = document.documentElement;
  if (appearance === "dark") {
    root.classList.add("dark");
  } else if (appearance === "light") {
    root.classList.remove("dark");
  } else {
    // system
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export function useTheme() {
  const [settings, setSettings] = useState<ThemeSettings>(getInitialSettings);

  useEffect(() => {
    applyColorTheme(settings.colorTheme);
    applyAppearance(settings.appearance);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply on first mount
  useEffect(() => {
    applyColorTheme(settings.colorTheme);
    applyAppearance(settings.appearance);
  }, []);

  const setColorTheme = (colorTheme: ColorTheme) =>
    setSettings(s => ({ ...s, colorTheme }));

  const setAppearance = (appearance: AppearanceMode) =>
    setSettings(s => ({ ...s, appearance }));

  return { settings, setColorTheme, setAppearance };
}
