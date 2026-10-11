import type { Work } from "@/types/work";
import { GalleryCard } from "@/components/gallery/GalleryCard";

// Related work is computed by shared category — ARCHITECTURE.md §8.
export function RelatedWork({ works }: { works: Work[] }) {
  if (works.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-8 sm:px-8" aria-label="Related work">
      <h2 className="mb-4 font-display text-sm italic text-graphite">More like this</h2>
      <div className="columns-2 gap-5 sm:columns-3 lg:columns-4">
        {works.map((work) => (
          <GalleryCard key={work.id} work={work} />
        ))}
      </div>
    </section>
  );
}
