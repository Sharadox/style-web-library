import { styleStorageKey } from "@sharadox/style-web-library/definition";
import type { StyleConfiguration } from "@sharadox/style-web-library/definition/type";
import type { StyleGroupData } from "@sharadox/style-web-library/apply/type";

/** The configuration reduced to what `applyStyles` needs. */
export function styleApplyData(configuration: StyleConfiguration): StyleGroupData[] {
  return configuration.groups.map((group) => ({
    name: group.name,
    storageKey: styleStorageKey(group),
    defaultChoice: group.defaultChoice,
    options: Object.fromEntries(group.options.map((option) => [option.name, option.scheme ?? null])),
    systemDefaults: group.systemDefaults ? { ...group.systemDefaults } : null,
    fallbackScheme: group.fallbackScheme ?? "dark",
  }));
}

/**
 * Writes each group's option to `<html>` (`data-style-<group>` and `data-style-<group>-choice`), and CSS
 * `color-scheme` for groups with schemes. With `only` and `choice`, applies that choice to that group; otherwise
 * every group's remembered choice (or its default). It is self-contained on purpose: the inline script in
 * `<head>` embeds its source, so the page never shows the wrong style before scripts load.
 */
export function applyStyles(groups: StyleGroupData[], only?: string, choice?: string): void {
  const root = document.documentElement;
  for (const group of groups) {
    if (only !== undefined && group.name !== only) continue;
    let wanted = only !== undefined ? choice : undefined;
    if (wanted === undefined) {
      try {
        wanted = localStorage.getItem(group.storageKey) || group.defaultChoice;
      } catch {
        wanted = group.defaultChoice;
      }
    }
    const known = wanted === "system" ? group.systemDefaults !== null : group.options[wanted] !== undefined;
    if (!known) wanted = group.defaultChoice;
    let name = wanted;
    if (wanted === "system") {
      let scheme = group.fallbackScheme;
      try {
        if (matchMedia("(prefers-color-scheme: light)").matches) scheme = "light";
        else if (matchMedia("(prefers-color-scheme: dark)").matches) scheme = "dark";
      } catch {
        // No media queries: keep the fallback.
      }
      name = (group.systemDefaults as Record<string, string>)[scheme] as string;
    }
    root.setAttribute(`data-style-${group.name}`, name);
    root.setAttribute(`data-style-${group.name}-choice`, wanted);
    const scheme = group.options[name];
    if (scheme) root.style.colorScheme = scheme;
  }
}
