import { expect, test } from "vitest";
import { styleChoices } from "@sharadox/style-web-library/style-choice";
import { STYLES } from "@sharadox/style-web-library/test-fixture";

test("color switches put light options, then system, then dark options", () => {
  expect(styleChoices(STYLES.groups[0])).toEqual([
    { name: "white", kind: "option", scheme: "light" },
    { name: "system", kind: "system" },
    { name: "black", kind: "option", scheme: "dark" },
    { name: "midnight", kind: "option", scheme: "dark" },
  ]);
});

test("other groups list their options in order", () => {
  expect(styleChoices(STYLES.groups[1])).toEqual([
    { name: "sharp", kind: "option" },
    { name: "rounded", kind: "option" },
  ]);
});
