import { SiteHeader } from "@/components/gallery/SiteHeader";
import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { getCategories } from "@/lib/data/categories";
import { getPublishedWorks } from "@/lib/data/works";

// Server Component: data fetching happens here, never inside presentation
// components (CODING_RULES.md §4, §8). No hero, no marketing copy above the
// fold — the homepage IS the work (PROJECT_CONTEXT.md §10).
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, works] = await Promise.all([
    getCategories(),
    getPublishedWorks(category),
  ]);

  return (
    <main>
      <SiteHeader />
      <CategoryFilter categories={categories} activeSlug={category} />
      <MasonryGrid works={works} />
    </main>
  );
}
