"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { applyStyles, styleApplyData } from "@sharadox/style-web-library/apply";
import {
  findGroup,
  styleAttribute,
  styleChoiceAttribute,
  styleStorageKey,
  SYSTEM_STYLE,
} from "@sharadox/style-web-library/definition";
import type { StyleConfiguration } from "@sharadox/style-web-library/definition/type";
import { styleChoices } from "@sharadox/style-web-library/style-choice";
import type { StyleState } from "@sharadox/style-web-library/use-style/type";

/**
 * A style group's choice and the option in use, kept in sync with `<html>`; `choose` remembers a new choice
 * (choosing the group's default forgets it).
 *
 * @example
 * const { choice, choices, choose } = useStyle(STYLES, "color");
 */
export function useStyle(configuration: StyleConfiguration, groupName: string): StyleState {
  const group = findGroup(configuration, groupName);
  if (!group) throw new Error(`no style group "${groupName}"`);
  const attribute = styleAttribute(group.name);
  const choiceAttribute = styleChoiceAttribute(group.name);
  const starting =
    group.defaultChoice === SYSTEM_STYLE ? group.systemDefaults![group.fallbackScheme ?? "dark"] : group.defaultChoice;
  const subscribe = useCallback(
    (notify: () => void) => {
      const observer = new MutationObserver(notify);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: [attribute, choiceAttribute] });
      return () => observer.disconnect();
    },
    [attribute, choiceAttribute],
  );
  const choice = useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute(choiceAttribute) ?? group.defaultChoice,
    () => group.defaultChoice,
  );
  const style = useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute(attribute) ?? starting,
    () => starting,
  );
  const data = useMemo(() => styleApplyData(configuration), [configuration]);
  const choose = useCallback(
    (next: string) => {
      try {
        if (next === group.defaultChoice) localStorage.removeItem(styleStorageKey(group));
        else localStorage.setItem(styleStorageKey(group), next);
      } catch {
        // Storage blocked (private mode): the choice still applies until the page closes.
      }
      applyStyles(data, group.name, next);
    },
    [data, group],
  );
  const choices = useMemo(() => styleChoices(group), [group]);
  return { choice, style, choices, choose };
}
