import { defineStyles } from "@sharadox/style-web-library/definition";

/** Two independent groups: colour (with System) and corner. */
export const STYLES = defineStyles({
  groups: [
    {
      name: "color",
      defaultChoice: "black",
      systemDefaults: { dark: "black", light: "white" },
      options: [
        { name: "black", scheme: "dark", palette: { background: "#000", foreground: "#fff" } },
        { name: "white", scheme: "light", palette: { background: "#fff", foreground: "#000" } },
        { name: "midnight", scheme: "dark", palette: { background: "#001", foreground: "#eef" } },
      ],
    },
    {
      name: "corner",
      defaultChoice: "rounded",
      storageKey: "corners",
      options: [
        { name: "sharp", palette: { radius: "0" } },
        { name: "rounded", palette: { radius: "12px" } },
      ],
    },
  ],
});

/** A colour group that follows the device from the start. */
export const SYSTEM_STYLES = defineStyles({
  groups: [{ ...STYLES.groups[0], defaultChoice: "system", fallbackScheme: "light" }],
});
