"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Tiny Client Component — only this fragment pays the hydration cost.
// Binds arrow-left / arrow-right keys for prev/next navigation in the viewer.
export function WorkKeyboardNav({
  previousSlug,
  nextSlug,
}: {
  previousSlug?: string;
  nextSlug?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Leave modified/repeated keys and editable controls to the browser.
      if (
        e.defaultPrevented ||
        e.repeat ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        (e.target instanceof HTMLElement &&
          (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) ||
            e.target.isContentEditable))
      ) {
        return;
      }

      const destination =
        e.key === "ArrowLeft"
          ? previousSlug
          : e.key === "ArrowRight"
            ? nextSlug
            : undefined;
      if (destination) {
        e.preventDefault();
        router.push(`/work/${destination}`);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [previousSlug, nextSlug, router]);

  // Renders nothing — pure behavior
  return null;
}
