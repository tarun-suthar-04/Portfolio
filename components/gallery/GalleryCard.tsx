import Link from "next/link";
import type { Work } from "@/types/work";
import { MediaFrame } from "./MediaFrame";
import { GalleryVideo } from "./GalleryVideo";

// Cards preserve each item's native aspect ratio — no forced cropping to a
// uniform grid (PROJECT_CONTEXT.md §11 / DESIGN.md §7). The category label
// is a quiet caption, not a colored badge, so it doesn't compete with the
// artwork (DESIGN.md §2).
export function GalleryCard({ work }: { work: Work }) {
  const primaryMedia = work.media[0];
  if (!primaryMedia) return null;

  return (
    <Link href={`/work/${work.slug}`} className="group mb-5 block break-inside-avoid">
      {primaryMedia.type === "video" ? (
        <GalleryVideo media={primaryMedia} />
      ) : (
        <MediaFrame media={primaryMedia} />
      )}
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className="font-display text-[15px] italic text-ink group-hover:text-accent">
          {work.title}
        </span>
        <span className="whitespace-nowrap text-xs text-graphite">{work.category.name}</span>
      </div>
    </Link>
  );
}
