import { Suspense } from "react";
import { SiteHeader } from "@/components/gallery/SiteHeader";
import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { getCategories } from "@/lib/data/categories";
import { getPublishedWorks } from "@/lib/data/works";

// Server Component: data fetching happens here, never inside presentation
// components (CODING_RULES.md §4, §8). No hero, no marketing copy above the
// fold — the homepage IS the work (PROJECT_CONTEXT.md §10).
//
// CategoryFilter is wrapped in <Suspense> because it calls useSearchParams()
// internally, which would otherwise force the entire page to defer rendering
// until the client hydrates. With the boundary, the header and grid can
// stream immediately while the filter resolves.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tool?: string }>;
}) {
  const { category, tool } = await searchParams;
  const [categories, works] = await Promise.all([
    getCategories(),
    getPublishedWorks(category),
  ]);
  const tools = [...new Set(works.flatMap((work) => work.toolsUsed))].sort((a, b) => a.localeCompare(b));
  const visibleWorks = tool ? works.filter((work) => work.toolsUsed.includes(tool)) : works;

  return (
    <main>
      <SiteHeader />
      <Suspense
        fallback={
          <div className="border-b border-line">
            <div className="mx-auto flex max-w-[1400px] gap-x-6 px-5 py-4 sm:px-8">
              {[72, 28, 64, 52, 80, 44].map((w, i) => (
                <div
                  key={i}
                  className="h-4 rounded bg-canvas animate-pulse"
                  style={{ width: w }}
                />
              ))}
            </div>
          </div>
        }
      >
        <CategoryFilter categories={categories} activeSlug={category} tools={tools} activeTool={tool} />
      </Suspense>
      <MasonryGrid works={visibleWorks} />
    </main>
  );
}
