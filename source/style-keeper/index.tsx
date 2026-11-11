"use client";
import { useLayoutEffect } from "react";
import { applyStyles } from "@sharadox/style-web-library/apply";
import type { StyleKeeperProperties } from "@sharadox/style-web-library/style-keeper/type";

/**
 * Applies every group's remembered style again whenever it mounts, before the browser paints. Navigating between
 * pages with different root layout parameters (for example `/en` → `/pt`) replaces `<html>`, which drops the
 * attributes the inline script set on the first load; this puts them back without a flash. `StyleScript` renders it.
 *
 * @example
 * <StyleKeeper groups={styleApplyData(STYLES)} />
 */
export function StyleKeeper({ groups }: StyleKeeperProperties) {
  useLayoutEffect(() => applyStyles(groups), [groups]);
  return null;
}
