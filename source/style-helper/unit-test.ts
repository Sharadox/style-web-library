import { join } from "node:path";
import { compileString } from "sass";
import { expect, test } from "vitest";

const loadPaths = [join(process.cwd(), "source")];
const compile = (scss: string) => compileString(`@use "style-helper" as *;\n${scss}`, { loadPaths }).css;

test("adds no CSS by itself", () => {
  expect(compile("")).toBe("");
});

test("gives the shared easing, breakpoint, tint, scroll entrance and entrance skip", () => {
  const css = compile(`
    .a { transition: opacity 1s $ease; color: tint(40%); @include below(600px) { display: none; } }
    .b { @include on-scroll(rise); @include skip-entrance(); }
    .c { @include on-scroll(rise, cover 0% cover 50%); @include skip-entrance(0.2s, 0.4s); }
  `);
  expect(css).toContain("cubic-bezier(0.22, 1, 0.36, 1)");
  expect(css).toContain("color-mix(in srgb, var(--foreground) 40%, transparent)");
  expect(css).toContain("@media (max-width: 600px)");
  expect(css).toContain("animation-timeline: view()");
  expect(css).toContain("animation-range: entry 10% cover 40%");
  expect(css).toContain("animation-range: cover 0% cover 50%");
  expect(css).toContain(":global(:root[data-soft-navigation]) .b");
  expect(css).toContain("animation-duration: 0s !important");
  expect(css).toContain("animation-duration: 0.2s, 0.4s !important");
});
