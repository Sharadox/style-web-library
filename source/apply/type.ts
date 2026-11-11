import type { ColorScheme } from "@sharadox/style-web-library/definition/type";

/** One group reduced to what `applyStyles` needs; plain data, so it can be embedded in the inline script. */
export interface StyleGroupData {
  name: string;
  storageKey: string;
  defaultChoice: string;
  /** Option name → its scheme, or null when the group has no schemes. */
  options: Record<string, ColorScheme | null>;
  systemDefaults: Record<ColorScheme, string> | null;
  fallbackScheme: ColorScheme;
}
