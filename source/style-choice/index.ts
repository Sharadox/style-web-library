import { SYSTEM_STYLE } from "@sharadox/style-web-library/definition";
import type { StyleGroup } from "@sharadox/style-web-library/definition/type";
import type { StyleChoice } from "@sharadox/style-web-library/style-choice/type";

/**
 * The entries of a group's switch, in display order. Groups with schemes put light options first, "system" in the
 * middle and dark options last; other groups list their options in order.
 *
 * @example
 * styleChoices(colorGroup).map((choice) => choice.name); // ["white", "system", "black"]
 */
export function styleChoices(group: StyleGroup): StyleChoice[] {
  const option = (name: string, scheme?: StyleChoice["scheme"]): StyleChoice => ({
    name,
    kind: "option",
    ...(scheme ? { scheme } : {}),
  });
  if (!group.systemDefaults) return group.options.map((choice) => option(choice.name, choice.scheme));
  const of = (scheme: "light" | "dark") =>
    group.options.filter((choice) => choice.scheme === scheme).map((choice) => option(choice.name, scheme));
  return [...of("light"), { name: SYSTEM_STYLE, kind: "system" }, ...of("dark")];
}
