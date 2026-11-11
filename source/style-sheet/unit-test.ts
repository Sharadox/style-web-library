import { expect, test } from "vitest";
import { styleSheet } from "@sharadox/style-web-library/style-sheet";
import { STYLES, SYSTEM_STYLES } from "@sharadox/style-web-library/test-fixture";

test("writes every group's starting option and every option", () => {
  expect(styleSheet(STYLES).split("\n")).toEqual([
    ":root{--background:#000;--foreground:#fff;color-scheme:dark}",
    ':root[data-style-color="black"]{--background:#000;--foreground:#fff;color-scheme:dark}',
    ':root[data-style-color="white"]{--background:#fff;--foreground:#000;color-scheme:light}',
    ':root[data-style-color="midnight"]{--background:#001;--foreground:#eef;color-scheme:dark}',
    ":root{--radius:12px}",
    ':root[data-style-corner="sharp"]{--radius:0}',
    ':root[data-style-corner="rounded"]{--radius:12px}',
  ]);
});

test("a group on system follows the device until the script runs", () => {
  const [first, second] = styleSheet(SYSTEM_STYLES).split("\n");
  expect(first).toBe(":root{--background:#fff;--foreground:#000;color-scheme:light}");
  expect(second).toBe(
    "@media (prefers-color-scheme:dark){:root:not([data-style-color]){--background:#000;--foreground:#fff;color-scheme:dark}}",
  );
  const dark = styleSheet({ groups: [{ ...SYSTEM_STYLES.groups[0], fallbackScheme: undefined }] }).split("\n");
  expect(dark[1]).toContain("@media (prefers-color-scheme:light)");
});
