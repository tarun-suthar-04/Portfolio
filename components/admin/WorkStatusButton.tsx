"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setWorkStatus } from "@/app/admin/actions";
import type { WorkStatus } from "@/types/work";

export function WorkStatusButton({
  workId,
  initialStatus,
}: {
  workId: string;
  initialStatus: WorkStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const targetStatus = status === "published" ? "draft" : "published";

  function toggleStatus() {
    setError("");
    startTransition(async () => {
      try {
        const result = await setWorkStatus(workId, targetStatus);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        setStatus(result.status);
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Couldn't change publish status.");
      }
    });
  }

  return (
    <div className="flex min-w-24 flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggleStatus}
        disabled={pending}
        className="rounded border border-line px-2.5 py-1.5 text-xs text-ink hover:bg-canvas disabled:opacity-50"
      >
        {pending ? "Saving…" : status === "published" ? "Unpublish" : "Publish"}
      </button>
      {error && <p role="alert" className="max-w-44 text-right text-xs text-red-700">{error}</p>}
    </div>
  );
}
