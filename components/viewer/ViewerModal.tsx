"use client";

import { useEffect, useRef } from "react";

// Uses the native <dialog> element so focus trapping and Escape-to-close
// (DESIGN.md §10, §20) come from the platform rather than a hand-rolled
// implementation. Closing performs a full navigation to the homepage, which
// also clears the intercepted route from the parallel modal slot.
export function ViewerModal({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  function close() {
    window.location.replace("/");
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
      <div className="flex h-full flex-col overflow-hidden">
        <div className="z-10 flex h-12 shrink-0 items-center justify-end bg-paper/95 px-5 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-sm text-graphite hover:text-accent"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
