/** Whether a style is dark or light; the device's preference (`prefers-color-scheme`) is one of these. */
export type ColorScheme = "dark" | "light";

/** One option of a style group, for example the color style "black" or the corner style "rounded". */
export interface StyleOption {
  /** Lower-case identifier, stored and written to `<html data-style-<group>>`. */
  name: string;
  /** For color-like groups: the option's scheme, which also sets CSS `color-scheme`. */
  scheme?: ColorScheme;
  /** CSS custom properties without the leading dashes: `{ background: "#000" }` → `--background: #000`. */
  palette: Readonly<Record<string, string>>;
}

/**
 * An independent style group: its own options, default, remembered choice and `<html>` attribute. A site can
 * have several at once (color, corner, font family…).
 */
export interface StyleGroup {
  /** Lower-case identifier, for example "color"; the attribute is `data-style-<name>`. */
  name: string;
  options: readonly StyleOption[];
  /**
   * The choice before the visitor picks one: an option name, or "system" (follow the device), which needs the
   * options to have schemes and `systemDefaults`.
   */
  defaultChoice: string;
  /** The option "system" uses for each scheme. */
  systemDefaults?: Readonly<Record<ColorScheme, string>>;
  /** The scheme assumed when the device's preference is unknown; "dark" by default. */
  fallbackScheme?: ColorScheme;
  /** Browser storage key that remembers a manual choice; `style-<name>` by default. */
  storageKey?: string;
}

/** Every style group of a site. */
export interface StyleConfiguration {
  groups: readonly StyleGroup[];
}
