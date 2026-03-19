/** Central registry for colour themes. */

export type ThemeName =
  | "classic"
  | "ocean"
  | "ember"
  | "amethyst"
  | "forest"
  | "rose"
  | "parchment";

export interface ThemeMeta {
  name: ThemeName;
  /** Human-readable label shown in the UI */
  label: string;
}

export const THEMES: readonly ThemeMeta[] = [
  { name: "classic", label: "Classic" },
  { name: "ocean", label: "Ocean" },
  { name: "ember", label: "Ember" },
  { name: "amethyst", label: "Amethyst" },
  { name: "forest", label: "Forest" },
  { name: "rose", label: "Rose" },
  { name: "parchment", label: "Parchment" },
] as const;

export const THEME_NAMES: readonly ThemeName[] = THEMES.map((t) => t.name);

/** Return the label for the *next* theme in the cycle (used on toggle buttons). */
export function nextThemeLabel(current: ThemeName): string {
  const idx = THEME_NAMES.indexOf(current);
  return THEMES[(idx + 1) % THEMES.length].label;
}
