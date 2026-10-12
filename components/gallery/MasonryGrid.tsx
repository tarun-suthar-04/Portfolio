import type { Work } from "@/types/work";
import { GalleryCard } from "./GalleryCard";

// CSS-columns masonry: simpler and more robust than a JS-measured layout,
// and it naturally respects each card's own aspect ratio (PROJECT_CONTEXT.md
// §11). Column count adapts by breakpoint per DESIGN.md §18.
export function MasonryGrid({ works }: { works: Work[] }) {
  if (works.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-20 text-center sm:px-8">
        <p className="font-display italic text-graphite">No work in this category yet.</p>
      </div>
    );
  }

  const featured = works.filter((work) => work.featured);
  const remaining = works.filter((work) => !work.featured);

  return (
    <div className="mx-auto max-w-[1400px] space-y-10 px-5 py-8 sm:px-8">
      {featured.length > 0 && (
        <section aria-labelledby="featured-work-heading">
          <h2 id="featured-work-heading" className="mb-5 font-display text-xl italic text-ink">
            Featured work
          </h2>
          <div className="columns-2 gap-5 sm:columns-3 lg:columns-4">
            {featured.map((work) => <GalleryCard key={work.id} work={work} />)}
          </div>
        </section>
      )}
      {remaining.length > 0 && (
        <section aria-label={featured.length > 0 ? "More work" : "Portfolio work"}>
          {featured.length > 0 && <h2 className="mb-5 font-display text-xl italic text-ink">More work</h2>}
          <div className="columns-2 gap-5 sm:columns-3 lg:columns-4">
            {remaining.map((work) => <GalleryCard key={work.id} work={work} />)}
          </div>
        </section>
      )}
    </div>
  );
}
