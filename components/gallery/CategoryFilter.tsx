"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/types/work";

// Data-driven per ARCHITECTURE.md §7 / FEATURES.md — categories always come
// from the CATEGORY table (here: mock data), never hardcoded in this file.
// Filtering is expressed as a query param (?category=slug) so it stays a
// normal, shareable link and a soft client-side navigation rather than a
// full page reload, per PROJECT_CONTEXT.md §10.
export function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(slug?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const isAllActive = !activeSlug;
  const activeCategory = categories.find((category) => category.slug === activeSlug);

  return (
    <nav aria-label="Filter by category" className="border-b border-line">
      <ul className="mx-auto flex max-w-[1400px] flex-wrap gap-x-6 gap-y-2 overflow-x-auto px-5 py-4 sm:px-8">
        <li>
          <Link
            href={hrefFor(undefined)}
            aria-current={isAllActive ? "true" : undefined}
            className={
              "text-sm transition-colors " +
              (isAllActive ? "text-accent" : "text-graphite hover:text-ink")
            }
          >
            All
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <li key={category.id}>
              <Link
                href={hrefFor(category.slug)}
                aria-current={isActive ? "true" : undefined}
                className={
                  "text-sm transition-colors " +
                  (isActive ? "text-accent" : "text-graphite hover:text-ink")
                }
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
      {activeCategory?.description && (
        <p className="mx-auto max-w-[1400px] px-5 pb-4 text-sm text-graphite sm:px-8">
          {activeCategory.description}
        </p>
      )}
    </nav>
  );
}
