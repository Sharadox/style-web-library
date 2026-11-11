import { applyStyles, styleApplyData } from "@sharadox/style-web-library/apply";
import { styleSheet } from "@sharadox/style-web-library/style-sheet";
import type { StyleConfiguration } from "@sharadox/style-web-library/definition/type";
import type { StyleScriptProperties } from "@sharadox/style-web-library/style-script/type";

/**
 * The inline script: applies every group's remembered style before the first paint, then follows the device (for
 * groups on "system") and other tabs while the page is open.
 */
export function styleScript(configuration: StyleConfiguration): string {
  const data = JSON.stringify(styleApplyData(configuration)).replace(/</g, "\\u003c");
  return `(function(){var apply=${applyStyles.toString()};var groups=${data};apply(groups);try{matchMedia("(prefers-color-scheme: light)").addEventListener("change",function(){apply(groups)});addEventListener("storage",function(event){for(var index=0;index<groups.length;index++){if(groups[index].storageKey===event.key)apply(groups)}})}catch(error){}})();`;
}

/**
 * Put in `<head>` (and add `suppressHydrationWarning` to `<html>`): the CSS custom properties of every style, and
 * the script that picks each group's style before the first paint.
 *
 * @example
 * <html lang="en" suppressHydrationWarning><head><StyleScript configuration={STYLES} /></head>…</html>
 */
export function StyleScript({ configuration }: StyleScriptProperties) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styleSheet(configuration) }} />
      <script dangerouslySetInnerHTML={{ __html: styleScript(configuration) }} />
    </>
  );
}
