"use client";

import { useEffect, useRef, useState } from "react";
import type { Media } from "@/types/work";
import { requestPlay, releaseIfCurrent } from "@/lib/activeVideoRegistry";

// Muted autoplay on hover/focus, pause on leave/blur, single-video-at-a-time.
// Keep the source lazy so the browser only requests a video when a visitor
// actually interacts with its card.
export function GalleryVideo({ media }: { media: Media }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // null = not yet interacted with; string = source assigned on first hover
  const [src, setSrc] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  function activate() {
    if (!media.url) return;
    setSrc(media.url);
    setIsActive(true);
  }

  function deactivate() {
    setIsActive(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    releaseIfCurrent(video);
  }

  const poster = getVideoPoster(media);

  useEffect(() => {
    const video = videoRef.current;
    if (video && src && isActive) {
      // Run after React has committed the src attribute to the video element.
      requestPlay(video);
    }
  }, [isActive, src]);

  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) releaseIfCurrent(video);
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-canvas rounded-card"
      style={{ aspectRatio: media.aspectRatio }}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
    >
      {media.url ? (
        <video
          ref={videoRef}
          src={src ?? undefined}
          poster={poster}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
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

function getVideoPoster(media: Media): string | undefined {
  if (!media.url) return media.thumbnailUrl;

  try {
    const url = new URL(media.url);
    const uploadMarker = "/video/upload/";
    const uploadIndex = url.pathname.indexOf(uploadMarker);
    if (uploadIndex < 0) return media.thumbnailUrl;

    // Pick a stable, asset-specific frame so server rendering stays consistent
    // while each video gets a representative still before the first hover.
    const key = media.publicId || media.url;
    let hash = 2166136261;
    for (let index = 0; index < key.length; index += 1) {
      hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
    }
    const fraction = (hash >>> 0) / 0xffffffff;
    const duration = media.duration;
    const maxSecond = typeof duration === "number" && duration > 0
      ? Math.max(0.1, duration - 0.2)
      : 6;
    const second = Math.min(maxSecond, 0.5 + fraction * Math.max(0, maxSecond - 0.5));
    const frame = Number(second.toFixed(2));

    const suffix = url.pathname.slice(uploadIndex + uploadMarker.length);
    const withoutExtension = suffix.replace(/\.(mp4|mov|webm|m4v)$/i, "");
    url.pathname = `${url.pathname.slice(0, uploadIndex + uploadMarker.length)}so_${frame},f_jpg,q_auto/${withoutExtension}.jpg`;
    return url.toString();
  } catch {
    return media.thumbnailUrl;
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
