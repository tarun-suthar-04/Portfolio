import Image from "next/image";
import type { Media } from "@/types/work";
import clsx from "clsx";

// Shared by gallery cards and the work viewer.
// Uses next/image with fill + aspect-ratio container to get:
//  - automatic WebP/AVIF conversion via Cloudinary + Next.js
//  - lazy loading by default (eager when priority=true for LCP)
//  - srcset / sizes for responsive delivery
//  - no layout shift (parent div reserves space via aspectRatio)
export function MediaFrame({
  media,
  className,
  priority = false,
  fit = "cover",
  controls = false,
}: {
  media: Media;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  controls?: boolean;
}) {
  const hasRealMedia = Boolean(media.url);

  return (
    <div
      className={clsx("relative w-full overflow-hidden bg-canvas rounded-card", className)}
      style={{ aspectRatio: media.aspectRatio }}
    >
      {hasRealMedia ? (
        media.type === "image" ? (
          <Image
            src={media.url}
            alt={media.altText ?? ""}
            fill
            // The viewer hero occupies the full content width; gallery cards
            // occupy one of two, three, or four columns.
            sizes={
              priority
                ? "(max-width: 1100px) 100vw, 1100px"
                : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            }
            priority={priority}
            className={fit === "contain" ? "object-contain" : "object-cover"}
          />
        ) : (
          <video
            src={media.url}
            poster={media.thumbnailUrl}
            className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
            controls={controls}
            muted={!controls}
            playsInline
            loop={!controls}
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
