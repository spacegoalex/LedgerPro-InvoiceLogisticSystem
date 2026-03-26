"use client";

import { useCallback, useEffect } from "react";

/**
 * useEnterNavigation: keyboard-first hook.
 * On Enter key, moves focus to the next focusable input/select/button in the container.
 * Skip mouse for heads-down data entry.
 */
export function useEnterNavigation(containerRef: React.RefObject<HTMLElement | null>) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !containerRef.current) return;
      const target = e.target as HTMLElement;
      if (!containerRef.current.contains(target)) return;

      const focusables = containerRef.current.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
      );
      const list = Array.from(focusables);
      const idx = list.indexOf(target);
      if (idx === -1) return;

      e.preventDefault();
      const next = list[idx + 1];
      if (next) {
        next.focus();
        if (next.tagName === "INPUT" || next.tagName === "TEXTAREA") {
          (next as HTMLInputElement).select?.();
        }
      }
    },
    [containerRef]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("keydown", handleKeyDown, true);
    return () => el.removeEventListener("keydown", handleKeyDown, true);
  }, [containerRef, handleKeyDown]);
}
