"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Uses the native <dialog> element so focus trapping and Escape-to-close
// (DESIGN.md §10, §20) come from the platform rather than a hand-rolled
// implementation. Closing returns to the gallery at its previous scroll
// position via router.back(), since this route was reached by intercepting
// a gallery click (ARCHITECTURE.md §2.3).
export function ViewerModal({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  function close() {
    router.back();
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        // Fired on Escape — intercept so we navigate back instead of just
        // closing the native element out from under the React tree.
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
      aria-label="Work detail"
      className="m-0 h-dvh max-h-none w-dvw max-w-none bg-paper p-0 backdrop:bg-ink/40"
    >
      <div className="h-full overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-end bg-paper/95 px-5 py-3 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-sm text-graphite hover:text-accent"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
