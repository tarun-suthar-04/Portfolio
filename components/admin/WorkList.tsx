"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkStatusButton } from "@/components/admin/WorkStatusButton";
import type { WorkStatus } from "@/types/work";

type WorkListItem = {
  id: string;
  title: string;
  status: WorkStatus;
  categoryName: string;
  categorySlug: string;
};

export function WorkList({ items }: { items: WorkListItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const categories = items.filter(
    (item, index, all) => all.findIndex((candidate) => candidate.categorySlug === item.categorySlug) === index
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.categoryName.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.categorySlug === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (items.length === 0) {
    return <p className="py-8 text-sm text-graphite">No works yet. Add your first work.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1 sm:col-span-1">
          <label htmlFor="work-search" className="block text-xs text-graphite">Search works</label>
          <input
            id="work-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Title or category"
            className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="work-status-filter" className="block text-xs text-graphite">Status</label>
          <select
            id="work-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | WorkStatus)}
            className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="work-category-filter" className="block text-xs text-graphite">Category</label>
          <select
            id="work-category-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-full rounded border border-line bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.categorySlug} value={category.categorySlug}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-line border-y border-line" aria-live="polite">
        {filteredItems.length === 0 ? (
          <p className="py-8 text-sm text-graphite">No works match these filters.</p>
        ) : (
          filteredItems.map((work) => (
            <div key={work.id} className="flex items-center gap-3 py-3">
              <Link
                href={`/admin/works/${work.id}`}
                className="flex min-w-0 flex-1 items-center justify-between gap-4 text-sm hover:text-accent"
              >
                <span className="flex-1 truncate">{work.title}</span>
                <span className="hidden text-graphite sm:inline">{work.categoryName}</span>
                <span
                  className={
                    "rounded-pill px-2 py-0.5 text-xs " +
                    (work.status === "published"
                      ? "bg-accent-soft text-accent"
                      : "bg-canvas text-graphite")
                  }
                >
                  {work.status}
                </span>
              </Link>
              <WorkStatusButton key={`${work.id}-${work.status}`} workId={work.id} initialStatus={work.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
