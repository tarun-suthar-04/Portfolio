"use client";

import { useActionState } from "react";
import { createCategory, deleteCategory } from "@/app/admin/actions";

// Client Component so we can use useActionState for both the create form
// and the per-row delete forms with inline error feedback.
export function CategoryManager({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
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
          categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))
        )}
      </ul>

      {/* Create form */}
      <form action={createAction} className="flex gap-3">
        <input
          name="name"
          placeholder="New category name"
          required
          className="flex-1 rounded border border-line bg-white px-3 py-3 text-ink"
        />
        <button
          type="submit"
          disabled={createPending}
          className="rounded bg-accent px-4 py-2 text-sm text-paper disabled:opacity-50"
        >
          {createPending ? "Adding…" : "Add"}
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
}: {
  category: { id: string; name: string; slug: string };
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | undefined) =>
      deleteCategory(category.id),
    undefined
  );

  return (
    <li className="flex items-center justify-between gap-4 py-3 text-sm">
      <span>{category.name}</span>
      <span className="text-graphite">{category.slug}</span>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="text-xs text-graphite hover:text-red-700 disabled:opacity-40"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
      </form>
      {state?.error && (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      )}
    </li>
  );
}
