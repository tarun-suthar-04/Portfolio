"use client";

import Link from "next/link";
import type { Work } from "@/types/work";
import { MediaFrame } from "@/components/gallery/MediaFrame";
import { GalleryVideo } from "@/components/gallery/GalleryVideo";

// Handles: media display, metadata, tools/tags, and prev/next navigation
// between works — ARCHITECTURE.md §8, DESIGN.md §10.
//
// A Client Component because prev/next uses keyboard shortcuts, which need
// browser event listeners; the underlying data is still fetched server-side
// (in the page component) and passed down as props.
export function WorkContent({
  work,
  previous,
  next,
}: {
  work: Work;
  previous?: Work;
  next?: Work;
}) {
  const hasMultipleMedia = work.media.length > 1;

  return (
    <article className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <div className="mb-8 flex items-center justify-between text-sm">
        <NavLink work={previous} direction="previous" />
        <NavLink work={next} direction="next" />
      </div>

      {/* Main media — the primary item, or first item of a multi-media set */}
      <MediaFrame media={work.media[0]!} className="mb-2" priority />

      {/* Simplified UI for single-media works: no thumbnail strip at all.
          Only shown when there is genuinely more than one media item. */}
      {hasMultipleMedia && (
        <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {work.media.slice(1).map((item) =>
            item.type === "video" ? (
              <GalleryVideo key={item.id} media={item} />
            ) : (
              <MediaFrame key={item.id} media={item} />
            )
          )}
        </div>
      )}

      <div className="mt-8 grid gap-8 sm:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="font-display text-2xl italic text-ink">{work.title}</h1>
          {work.description && (
            <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-graphite">
              {work.description}
            </p>
          )}
        </div>

        <dl className="space-y-3 text-sm">
          <Meta label="Category" value={work.category.name} />
          <Meta label="Date" value={formatDate(work.createdAt)} />
          {work.toolsUsed.length > 0 && (
            <Meta label="Tools" value={work.toolsUsed.join(", ")} />
          )}
        </dl>
      </div>
    </article>
  );
}

function NavLink({ work, direction }: { work?: Work; direction: "previous" | "next" }) {
  if (!work) {
    return <span className="text-graphite/40">{direction === "previous" ? "← Previous" : "Next →"}</span>;
  }
  return (
    <Link href={`/work/${work.slug}`} className="text-graphite hover:text-accent">
      {direction === "previous" ? `← ${work.title}` : `${work.title} →`}
    </Link>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2 sm:block sm:border-none sm:pb-0">
      <dt className="text-graphite">{label}</dt>
      <dd className="text-ink sm:mt-1">{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
