import { describe, expect, test } from "vitest";
import {
  defineStyles,
  findGroup,
  findOption,
  resolveOption,
  styleAttribute,
  styleChoiceAttribute,
  styleStorageKey,
} from "@sharadox/style-web-library/definition";
import { STYLES, SYSTEM_STYLES } from "@sharadox/style-web-library/test-fixture";

const color = STYLES.groups[0];
const corner = STYLES.groups[1];

describe("defineStyles", () => {
  const option = (name: string) => ({ name, palette: {} });
  test.each([
    [
      {
        groups: [
          { name: "a", defaultChoice: "x", options: [option("x")] },
          { name: "a", defaultChoice: "x", options: [option("x")] },
        ],
      },
      'style group "a" is defined twice',
    ],
    [
      { groups: [{ name: "a", defaultChoice: "x", options: [option("x"), option("x")] }] },
      'style group "a" repeats an option',
    ],
    [{ groups: [{ name: "a", defaultChoice: "x", options: [option("system")] }] }, '"system" can\'t be an option name'],
    [
      {
        groups: [{ name: "a", defaultChoice: "x", systemDefaults: { dark: "x", light: "y" }, options: [option("x")] }],
      },
      'style group "a" has no option "y" for system',
    ],
    [{ groups: [{ name: "a", defaultChoice: "y", options: [option("x")] }] }, 'style group "a" can\'t start with "y"'],
    [
      { groups: [{ name: "a", defaultChoice: "system", options: [option("x")] }] },
      'style group "a" can\'t start with "system"',
    ],
  ])("rejects a broken configuration (%#)", (configuration, message) => {
    expect(() => defineStyles(configuration)).toThrow(message);
  });

  test("returns a valid configuration as it is", () => {
    expect(STYLES.groups.map((group) => group.name)).toEqual(["color", "corner"]);
  });
});

describe("names", () => {
  test("attributes and storage keys", () => {
    expect(styleAttribute("color")).toBe("data-style-color");
    expect(styleChoiceAttribute("color")).toBe("data-style-color-choice");
    expect(styleStorageKey(color)).toBe("style-color");
    expect(styleStorageKey(corner)).toBe("corners");
  });

  test("finders", () => {
    expect(findGroup(STYLES, "corner")).toBe(corner);
    expect(findGroup(STYLES, "font")).toBeUndefined();
    expect(findOption(color, "white")?.scheme).toBe("light");
    expect(findOption(color, "sepia")).toBeUndefined();
  });
});

describe("resolveOption", () => {
  test("uses a chosen option whatever the device says", () => {
    expect(resolveOption(color, "midnight", "light").name).toBe("midnight");
  });

  test("follows the device for system, with the fallback when unknown", () => {
    expect(resolveOption(color, "system", "light").name).toBe("white");
    expect(resolveOption(color, "system", undefined).name).toBe("black");
    expect(resolveOption(SYSTEM_STYLES.groups[0], "system", undefined).name).toBe("white");
  });

  test("falls back to the group's default for unknown names", () => {
    expect(resolveOption(color, "sepia", "light").name).toBe("black");
    expect(resolveOption(SYSTEM_STYLES.groups[0], "sepia", "dark").name).toBe("black");
    expect(resolveOption(corner, "sepia", undefined).name).toBe("rounded");
  });
});
