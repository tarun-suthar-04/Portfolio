"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory, moveCategory, updateCategoryDescription } from "@/app/admin/actions";

// Client Component so we can use useActionState for both the create form
// and the per-row delete forms with inline error feedback.
export function CategoryManager({
  categories,
}: {
  categories: { id: string; name: string; slug: string; description?: string }[];
}) {
  const router = useRouter();
  const [movePending, startMove] = useTransition();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState("");
  const [createState, createAction, createPending] = useActionState(
    createCategory,
    undefined
  );

  return (
    <div className="max-w-xl">
      <ul className="mb-8 divide-y divide-line border-y border-line">
        {categories.length === 0 ? (
          <li className="py-6 text-sm text-graphite">
            No categories yet. Add one below.
          </li>
        ) : (
          categories.map((category, index) => (
            <CategoryRow
              key={category.id}
              category={category}
              index={index}
              itemCount={categories.length}
              movePending={movePending}
              moving={movingId === category.id}
              onMove={(direction) => {
                if (movePending) return;
                setMoveError("");
                setMovingId(category.id);
                startMove(async () => {
                  try {
                    const result = await moveCategory(category.id, direction);
                    if ("error" in result) {
                      setMoveError(result.error);
                    } else {
                      router.refresh();
                    }
                  } catch (error) {
                    setMoveError(error instanceof Error ? error.message : "Couldn't reorder categories.");
                  } finally {
                    setMovingId(null);
                  }
                });
              }}
            />
          ))
        )}
      </ul>
      {moveError && <p role="alert" className="mb-4 text-sm text-red-700">{moveError}</p>}

      {/* Create form */}
      <form action={createAction} className="space-y-3">
        <input name="name" placeholder="New category name" required maxLength={80}
          className="w-full rounded border border-line bg-white px-3 py-3 text-ink" />
        <textarea name="description" placeholder="Category description (optional)" maxLength={500} rows={3}
          className="w-full rounded border border-line bg-white px-3 py-3 text-ink" />
        <button type="submit" disabled={createPending}
          className="rounded bg-accent px-4 py-2 text-sm text-paper disabled:opacity-50">
          {createPending ? "Adding…" : "Add category"}
        </button>
      </form>
      {createState?.error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {createState.error}
        </p>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  index,
  itemCount,
  movePending,
  moving,
  onMove,
}: {
  category: { id: string; name: string; slug: string; description?: string };
  index: number;
  itemCount: number;
  movePending: boolean;
  moving: boolean;
  onMove: (direction: "up" | "down") => void;
}) {
  const router = useRouter();
  const [description, setDescription] = useState(category.description ?? "");
  const [descriptionPending, startDescription] = useTransition();
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionSaved, setDescriptionSaved] = useState(false);
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | undefined) =>
      deleteCategory(category.id),
    undefined
  );

  return (
    <li className="space-y-3 py-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="min-w-28 flex-1">{category.name}</span>
        <span className="text-graphite">{category.slug}</span>
        <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onMove("up")}
          disabled={movePending || index === 0}
          className="text-xs text-graphite underline disabled:opacity-40"
          aria-label={`Move ${category.name} up`}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMove("down")}
          disabled={movePending || index === itemCount - 1}
          className="text-xs text-graphite underline disabled:opacity-40"
          aria-label={`Move ${category.name} down`}
        >
          ↓
        </button>
        <form action={action}>
          <button
            type="submit"
            disabled={pending || movePending}
            className="text-xs text-graphite hover:text-red-700 disabled:opacity-40"
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </form>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor={`category-description-${category.id}`} className="block text-xs text-graphite">Description</label>
        <textarea id={`category-description-${category.id}`} value={description} maxLength={500} rows={2}
          onChange={(event) => { setDescription(event.target.value); setDescriptionSaved(false); }}
          disabled={descriptionPending || pending || movePending}
          className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink" />
        <button type="button" disabled={descriptionPending || pending || movePending || description.trim() === (category.description ?? "")}
          onClick={() => {
            setDescriptionError("");
            startDescription(async () => {
              const result = await updateCategoryDescription(category.id, description);
              if ("error" in result) setDescriptionError(result.error);
              else { setDescription(result.description ?? ""); setDescriptionSaved(true); router.refresh(); }
            });
          }}
          className="rounded border border-line px-3 py-1.5 text-xs text-ink disabled:opacity-50">
          {descriptionPending ? "Saving…" : "Save description"}
        </button>
        {descriptionSaved && <span role="status" className="ml-3 text-xs text-graphite">Saved</span>}
        {descriptionError && <p role="alert" className="text-xs text-red-700">{descriptionError}</p>}
      </div>
      {moving && <span aria-live="polite" className="text-xs text-graphite">Moving…</span>}
      {state?.error && (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      )}
    </li>
  );
}
