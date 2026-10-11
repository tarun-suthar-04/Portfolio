"use client";

import { useActionState } from "react";
import type { Category, Work } from "@/types/work";
import { saveWork } from "@/app/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";

// Used for both "new work" and "edit work". A new record must be saved first
// so signed media uploads can be scoped to its stable work ID.
export function WorkForm({
  categories,
  work,
}: {
  categories: Category[];
  work?: Work;
}) {
  const [state, formAction, pending] = useActionState(saveWork, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {work && <input type="hidden" name="id" value={work.id} />}

      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          defaultValue={work?.title}
          required
          className="w-full rounded border border-line bg-white px-3 py-3 text-ink"
        />
      </Field>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          defaultValue={work?.description}
          rows={4}
          className="w-full rounded border border-line bg-white px-3 py-3 text-ink"
        />
      </Field>

      <Field label="Category" htmlFor="categoryId">
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={work?.categoryId}
          required
          className="w-full rounded border border-line bg-white px-3 py-3 text-ink"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tools used (comma-separated)" htmlFor="toolsUsed">
        <input
          id="toolsUsed"
          name="toolsUsed"
          defaultValue={work?.toolsUsed.join(", ")}
          className="w-full rounded border border-line bg-white px-3 py-3 text-ink"
        />
      </Field>

      <div className="flex items-center gap-3">
        <input
          id="featured"
          name="featured"
          type="checkbox"
          defaultChecked={work?.featured}
          className="h-5 w-5"
        />
        <label htmlFor="featured" className="text-sm text-graphite">
          Featured
        </label>
      </div>

      <Field label="Status" htmlFor="status">
        <select
          id="status"
          name="status"
          defaultValue={work?.status ?? "draft"}
          className="w-full rounded border border-line bg-white px-3 py-3 text-ink"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </Field>

      {work ? (
        <MediaUploader work={work} />
      ) : (
        <p className="rounded border border-dashed border-line p-4 text-sm text-graphite">
          Save this work first. You can add images and videos from its edit page.
        </p>
      )}

      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-accent px-5 py-3 text-sm text-paper disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm text-graphite">
        {label}
      </label>
      {children}
    </div>
  );
}
