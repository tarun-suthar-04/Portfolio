"use client";

import { useEffect, useRef } from "react";
import type { Media } from "@/types/work";
import { requestPlay, releaseIfCurrent } from "@/lib/activeVideoRegistry";

// Muted autoplay on enter viewport, pause on exit, single-video-at-a-time —
// per ARCHITECTURE.md §9 and DESIGN.md §8. Falls back to a static poster
// placeholder when no real Cloudinary url exists yet.
export function GalleryVideo({ media }: { media: Media }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          requestPlay(video);
        } else {
          video.pause();
          releaseIfCurrent(video);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      releaseIfCurrent(video);
    };
  }, []);

  const hasRealMedia = Boolean(media.url);

  return (
    <div
      className="relative w-full overflow-hidden bg-canvas rounded-card"
      style={{ aspectRatio: media.aspectRatio }}
    >
      {hasRealMedia ? (
        <video
          ref={videoRef}
          src={media.url}
          poster={media.thumbnailUrl}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-graphite" aria-hidden="true">
          <span className="font-display text-sm italic">video placeholder</span>
        </div>
      )}

      {/* Play indicator */}
      <div className="pointer-events-none absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70">
        <svg width="8" height="10" viewBox="0 0 8 10" fill="none" aria-hidden="true">
          <path d="M0 0L8 5L0 10V0Z" fill="#F7F6F3" />
        </svg>
      </div>

      {/* Duration indicator */}
      {typeof media.duration === "number" && (
        <div className="pointer-events-none absolute bottom-3 right-3 rounded bg-ink/70 px-1.5 py-0.5 text-xs text-paper">
          {formatDuration(media.duration)}
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
