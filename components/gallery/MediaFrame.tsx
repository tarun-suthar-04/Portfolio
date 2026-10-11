import type { Media } from "@/types/work";
import clsx from "clsx";

// Shared by gallery cards and the work viewer, per CODING_RULES.md §20
// (extract once real duplication exists — this is used in both places).
//
// Reserves space using aspectRatio BEFORE the asset loads, to avoid layout
// shift (DESIGN.md §7). Falls back to a quiet neutral placeholder when no
// real url is present yet (current state: Cloudinary isn't connected).
export function MediaFrame({
  media,
  className,
  priority = false,
}: {
  media: Media;
  className?: string;
  priority?: boolean;
}) {
  const hasRealMedia = Boolean(media.url);

  return (
    <div
      className={clsx("relative w-full overflow-hidden bg-canvas rounded-card", className)}
      style={{ aspectRatio: media.aspectRatio }}
    >
      {hasRealMedia ? (
        media.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt={media.altText ?? ""}
            className="h-full w-full object-cover"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <video
            src={media.url}
            poster={media.thumbnailUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            loop
          />
        )
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-graphite"
          aria-hidden="true"
        >
          <span className="font-display text-sm italic">
            {media.type === "video" ? "video placeholder" : "image placeholder"}
          </span>
        </div>
      )}
    </div>
  );
}
