import type { StyleChoice } from "@sharadox/style-web-library/style-choice/type";

export interface StyleState {
  /** What the visitor picked: "system" or an option name. */
  choice: string;
  /** The option in use right now. On the server and before hydration it is the group's starting option. */
  style: string;
  /** The switch's entries in display order. */
  choices: StyleChoice[];
  /** Picks an option (or "system"), remembers it and applies it at once. */
  choose: (choice: string) => void;
}
