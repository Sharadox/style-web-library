// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { applyStyles, styleApplyData } from "@sharadox/style-web-library/apply";
import { StyleScript, styleScript } from "@sharadox/style-web-library/style-script";
import { useStyle } from "@sharadox/style-web-library/use-style";
import { STYLES, SYSTEM_STYLES } from "@sharadox/style-web-library/test-fixture";
import type { StyleConfiguration } from "@sharadox/style-web-library/definition/type";

const root = document.documentElement;
const listeners: Record<string, () => void> = {};
const prefers = (light: boolean | undefined) =>
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
    if (light === undefined) throw new Error("no media queries");
    return {
      matches: query.includes("light") ? light : !light,
      addEventListener: (_: string, listener: () => void) => (listeners.media = listener),
    } as unknown as MediaQueryList;
  });
const run = (configuration: StyleConfiguration = STYLES) => new Function(styleScript(configuration))();

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  for (const attribute of [...root.getAttributeNames()])
    if (attribute.startsWith("data-style")) root.removeAttribute(attribute);
  root.style.colorScheme = "";
});

describe("the inline script", () => {
  test("applies every group's default, whatever the device prefers", () => {
    prefers(true);
    run();
    expect(root.getAttribute("data-style-color")).toBe("black");
    expect(root.getAttribute("data-style-color-choice")).toBe("black");
    expect(root.getAttribute("data-style-corner")).toBe("rounded");
    expect(root.style.colorScheme).toBe("dark");
  });

  test("applies remembered choices and ignores stale ones", () => {
    prefers(true);
    localStorage.setItem("style-color", "system");
    localStorage.setItem("corners", "removed");
    run();
    expect(root.getAttribute("data-style-color")).toBe("white");
    expect(root.getAttribute("data-style-corner")).toBe("rounded");
  });

  test("follows the device, the fallback without media queries, and other tabs", () => {
    prefers(false);
    run(SYSTEM_STYLES);
    expect(root.getAttribute("data-style-color")).toBe("black");
    vi.restoreAllMocks();
    prefers(undefined);
    run(SYSTEM_STYLES);
    expect(root.getAttribute("data-style-color")).toBe("white");
    vi.restoreAllMocks();
    prefers(true);
    run(SYSTEM_STYLES);
    localStorage.setItem("style-color", "midnight");
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    expect(root.getAttribute("data-style-color")).toBe("white");
    window.dispatchEvent(new StorageEvent("storage", { key: "style-color" }));
    expect(root.getAttribute("data-style-color")).toBe("midnight");
    localStorage.removeItem("style-color");
    listeners.media!();
    expect(root.getAttribute("data-style-color")).toBe("white");
  });

  test("uses defaults when storage is blocked", () => {
    prefers(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    applyStyles(styleApplyData(STYLES));
    expect(root.getAttribute("data-style-color")).toBe("black");
  });

  test("an unknown system choice falls back to the default", () => {
    prefers(true);
    applyStyles(styleApplyData({ groups: [STYLES.groups[1]] }), "corner", "system");
    expect(root.getAttribute("data-style-corner-choice")).toBe("rounded");
  });

  test("StyleScript renders the style sheet and the script", () => {
    const html = renderToStaticMarkup(<StyleScript configuration={STYLES} />);
    expect(html).toMatch(/^<style>:root\{--background:#000.*<\/style><script>\(function\(\)\{var apply=.*<\/script>$/s);
  });
});

describe("useStyle", () => {
  test("starts on the default, remembers other choices and forgets the default", async () => {
    prefers(true);
    const { result } = renderHook(() => useStyle(STYLES, "color"));
    expect(result.current).toMatchObject({ choice: "black", style: "black" });
    expect(result.current.choices.map((choice) => choice.name)).toEqual(["white", "system", "black", "midnight"]);
    await act(async () => result.current.choose("system"));
    expect(localStorage.getItem("style-color")).toBe("system");
    expect(result.current).toMatchObject({ choice: "system", style: "white" });
    await act(async () => result.current.choose("black"));
    expect(localStorage.getItem("style-color")).toBeNull();
    expect(result.current.style).toBe("black");
  });

  test("starts a system group on its fallback scheme's option", () => {
    const { result } = renderHook(() => useStyle(SYSTEM_STYLES, "color"));
    expect(result.current).toMatchObject({ choice: "system", style: "white" });
  });

  test("still applies when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useStyle(STYLES, "corner"));
    await act(async () => result.current.choose("sharp"));
    expect(result.current.style).toBe("sharp");
  });

  test("fails clearly for an unknown group", () => {
    expect(() => renderHook(() => useStyle(STYLES, "font"))).toThrow('no style group "font"');
  });
});

describe("applyStyles itself (the script embeds the same function)", () => {
  test("uses defaults when storage is blocked and the fallback without media queries", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("blocked");
    });
    prefers(undefined);
    applyStyles(styleApplyData(SYSTEM_STYLES));
    vi.restoreAllMocks();
    expect(root.getAttribute("data-style-color")).toBe("white");
  });

  test("follows a dark device, and applies one group without touching the others", () => {
    prefers(false);
    applyStyles(styleApplyData(STYLES), "color", "system");
    expect(root.getAttribute("data-style-color")).toBe("black");
    expect(root.getAttribute("data-style-corner")).toBeNull();
    vi.restoreAllMocks();
    prefers(true);
    applyStyles(styleApplyData(STYLES), "color", "system");
    expect(root.getAttribute("data-style-color")).toBe("white");
  });

  test("a device without a light or dark preference keeps the fallback", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
    applyStyles(styleApplyData(SYSTEM_STYLES), "color", "system");
    expect(root.getAttribute("data-style-color")).toBe("white");
  });
});

describe("useStyle on the server", () => {
  test("renders the group's starting choice and option", () => {
    function Probe({ group }: { group: string }) {
      const { choice, style } = useStyle(group === "system" ? SYSTEM_STYLES : STYLES, "color");
      return (
        <p>
          {choice}/{style}
        </p>
      );
    }
    expect(renderToStaticMarkup(<Probe group="fixed" />)).toBe("<p>black/black</p>");
    expect(renderToStaticMarkup(<Probe group="system" />)).toBe("<p>system/white</p>");
    const darkFirst = { groups: [{ ...SYSTEM_STYLES.groups[0], fallbackScheme: undefined }] };
    function DarkFirst() {
      return <p>{useStyle(darkFirst, "color").style}</p>;
    }
    expect(renderToStaticMarkup(<DarkFirst />)).toBe("<p>black</p>");
  });

  test("reacts to attribute changes made elsewhere and stops listening when unmounted", async () => {
    const { result, unmount } = renderHook(() => useStyle(STYLES, "color"));
    await act(async () => root.setAttribute("data-style-color", "midnight"));
    expect(result.current.style).toBe("midnight");
    unmount();
  });
});
