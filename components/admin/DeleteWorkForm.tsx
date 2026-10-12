"use client";

import type { FormEvent } from "react";

export function DeleteWorkForm({
  action,
  workTitle,
}: {
  action: () => Promise<void>;
  workTitle: string;
}) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Permanently delete “${workTitle}” and all its media? This cannot be undone.`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={confirmDelete}>
      <button
        type="submit"
        className="rounded border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
      >
        Delete this work
      </button>
    </form>
  );
}
