import type { ColorScheme } from "@sharadox/style-web-library/definition/type";

/** One entry of a style switch: "system" or an option, with its scheme for icons. */
export interface StyleChoice {
  name: string;
  kind: "system" | "option";
  scheme?: ColorScheme;
}
