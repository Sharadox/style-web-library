import { findOption, SYSTEM_STYLE } from "@sharadox/style-web-library/definition";
import type { StyleConfiguration, StyleGroup, StyleOption } from "@sharadox/style-web-library/definition/type";

const declarations = (option: StyleOption) =>
  [
    ...Object.entries(option.palette).map(([key, value]) => `--${key}:${value}`),
    ...(option.scheme ? [`color-scheme:${option.scheme}`] : []),
  ].join(";");

/** The CSS for one group: its starting option on `:root`, the device's scheme while it follows "system", and each option. */
function groupSheet(group: StyleGroup): string[] {
  const attribute = `data-style-${group.name}`;
  const rules: string[] = [];
  if (group.defaultChoice === SYSTEM_STYLE) {
    const fallback = group.fallbackScheme ?? "dark";
    const other = fallback === "dark" ? "light" : "dark";
    rules.push(`:root{${declarations(findOption(group, group.systemDefaults![fallback])!)}}`);
    rules.push(
      `@media (prefers-color-scheme:${other}){:root:not([${attribute}]){${declarations(findOption(group, group.systemDefaults![other])!)}}}`,
    );
  } else {
    rules.push(`:root{${declarations(findOption(group, group.defaultChoice)!)}}`);
  }
  for (const option of group.options) rules.push(`:root[${attribute}="${option.name}"]{${declarations(option)}}`);
  return rules;
}

/**
 * The CSS of every style group, from the configuration alone: each option under `:root[data-style-<group>="…"]`,
 * plus each group's starting option on `:root` for the moment before the inline script runs (or when scripts are
 * off). A group that starts on "system" follows the device with a media query until then.
 *
 * @example
 * styleSheet(STYLES); // ":root{--background:#000;color-scheme:dark}\n:root[data-style-color=\"black\"]{…}"
 */
export function styleSheet(configuration: StyleConfiguration): string {
  return configuration.groups.flatMap(groupSheet).join("\n");
}
