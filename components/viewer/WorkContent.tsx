import Link from "next/link";
import type { Work } from "@/types/work";
import { MediaFrame } from "@/components/gallery/MediaFrame";
import { WorkKeyboardNav } from "./WorkKeyboardNav";

// Server Component — all static content (title, description, metadata,
// media) renders as HTML with zero client JS. Only the keyboard shortcut
// handler (arrow prev/next) is isolated in a tiny Client Component.
export function WorkContent({
  work,
  previous,
  next,
  inModal = false,
}: {
  work: Work;
  previous?: Work;
  next?: Work;
  inModal?: boolean;
}) {
  const hasMultipleMedia = work.media.length > 1;
  const heightClass = inModal
    ? "h-[calc(100dvh-48px)]"
    : "min-h-[calc(100dvh-69px)] lg:h-[calc(100dvh-69px)]";

  return (
    <article className={`mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-5 py-4 sm:px-8 ${heightClass}`}>
      {/* Keyboard navigation (arrow keys) — client-only, no SSR penalty */}
      <WorkKeyboardNav
        previousSlug={previous?.slug}
        nextSlug={next?.slug}
      />

      <div className="flex shrink-0 items-center justify-between text-sm">
        <NavLink work={previous} direction="previous" />
        <NavLink work={next} direction="next" />
      </div>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-label="Work media" className="flex min-h-[48svh] min-w-0 flex-col gap-3 lg:min-h-0">
          <MediaFrame media={work.media[0]!} className="min-h-0 flex-1" priority fit="contain" controls />
          {hasMultipleMedia && (
            <div aria-label="Additional media" className="flex max-h-24 shrink-0 gap-2 overflow-x-auto pb-1">
              {work.media.slice(1).map((item) => (
                <MediaFrame key={item.id} media={item} className="h-20 w-28 shrink-0" fit="contain" controls />
              ))}
            </div>
          )}
        </section>

        <aside className="min-h-0 overflow-y-auto border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-2">
          <h1 className="font-display text-2xl italic text-ink">{work.title}</h1>
          {work.description && (
            <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-graphite">
              {work.description}
            </p>
          )}

          <dl className="mt-8 space-y-4 text-sm">
            <Meta label="Category" value={work.category.name} />
            <Meta label="Date" value={formatDate(work.createdAt)} />
            {work.toolsUsed.length > 0 && (
              <Meta label="Tools" value={work.toolsUsed.join(", ")} />
            )}
          </dl>
        </aside>
      </div>
    </article>
  );
}

function NavLink({ work, direction }: { work?: Work; direction: "previous" | "next" }) {
  if (!work) {
    return (
      <span className="text-graphite/40">
        {direction === "previous" ? "← Previous" : "Next →"}
      </span>
    );
  }
  return (
    <Link href={`/work/${work.slug}`} className="text-graphite hover:text-accent">
      {direction === "previous" ? `← ${work.title}` : `${work.title} →`}
    </Link>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line pb-2">
      <dt className="text-graphite">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
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
