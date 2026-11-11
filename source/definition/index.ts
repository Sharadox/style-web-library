import type {
  ColorScheme,
  StyleConfiguration,
  StyleGroup,
  StyleOption,
} from "@sharadox/style-web-library/definition/type";

/** The choice that follows the device's light or dark setting. */
export const SYSTEM_STYLE = "system";

/** `<html>` attribute holding a group's option in use, for CSS: `[data-style-color="black"]`. */
export const styleAttribute = (group: string) => `data-style-${group}`;
/** `<html>` attribute holding a group's choice ("system" or an option), for switches. */
export const styleChoiceAttribute = (group: string) => `data-style-${group}-choice`;
/** Where a group's manual choice is remembered. */
export const styleStorageKey = (group: StyleGroup) => group.storageKey ?? `style-${group.name}`;

/** Finds an option of a group by name. */
export function findOption(group: StyleGroup, name: string): StyleOption | undefined {
  return group.options.find((option) => option.name === name);
}

/** Finds a group by name. */
export function findGroup(configuration: StyleConfiguration, name: string): StyleGroup | undefined {
  return configuration.groups.find((group) => group.name === name);
}

/**
 * Checks a style configuration and returns it: groups and options are unique, defaults name real options, and
 * "system" is only used by groups whose options have schemes and `systemDefaults`.
 *
 * @example
 * export const STYLES = defineStyles({ groups: [{ name: "color", defaultChoice: "black", options: [...], systemDefaults: { dark: "black", light: "white" } }] });
 */
export function defineStyles<const Configuration extends StyleConfiguration>(
  configuration: Configuration,
): Configuration {
  const groupNames = new Set<string>();
  for (const group of configuration.groups) {
    if (groupNames.has(group.name)) throw new Error(`style group "${group.name}" is defined twice`);
    groupNames.add(group.name);
    const optionNames = new Set(group.options.map((option) => option.name));
    if (optionNames.size !== group.options.length) throw new Error(`style group "${group.name}" repeats an option`);
    if (optionNames.has(SYSTEM_STYLE)) throw new Error(`"${SYSTEM_STYLE}" can't be an option name`);
    if (group.systemDefaults) {
      for (const name of Object.values(group.systemDefaults)) {
        if (!optionNames.has(name)) throw new Error(`style group "${group.name}" has no option "${name}" for system`);
      }
    }
    if (group.defaultChoice === SYSTEM_STYLE ? !group.systemDefaults : !optionNames.has(group.defaultChoice)) {
      throw new Error(`style group "${group.name}" can't start with "${group.defaultChoice}"`);
    }
  }
  return configuration;
}

/**
 * The option shown for a choice: the chosen option, or for "system" (and unknown names, which fall back to the
 * group's default) the option for the device's scheme.
 */
export function resolveOption(group: StyleGroup, choice: string, systemScheme: ColorScheme | undefined): StyleOption {
  const wanted = choice === SYSTEM_STYLE || findOption(group, choice) ? choice : group.defaultChoice;
  if (wanted !== SYSTEM_STYLE) return findOption(group, wanted)!;
  const scheme = systemScheme ?? group.fallbackScheme ?? "dark";
  return findOption(group, group.systemDefaults![scheme])!;
}
