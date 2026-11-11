// @vitest-environment happy-dom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { styleApplyData } from "@sharadox/style-web-library/apply";
import { StyleKeeper } from "@sharadox/style-web-library/style-keeper";
import { STYLES } from "@sharadox/style-web-library/test-fixture";

afterEach(() => {
  cleanup();
  localStorage.clear();
  for (const attribute of [...document.documentElement.getAttributeNames()])
    if (attribute.startsWith("data-style")) document.documentElement.removeAttribute(attribute);
});

test("puts the remembered styles back on a new <html> when it mounts", () => {
  localStorage.setItem("style-color", "white");
  render(<StyleKeeper groups={styleApplyData(STYLES)} />);
  expect(document.documentElement.getAttribute("data-style-color")).toBe("white");
  expect(document.documentElement.getAttribute("data-style-color-choice")).toBe("white");
});
