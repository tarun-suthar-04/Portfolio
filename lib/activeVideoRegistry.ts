// A minimal, dependency-free registry so that starting playback on one
// video pauses any other currently-playing video in the gallery.
// See ARCHITECTURE.md §9 — "only one video plays at a time."
let currentlyPlaying: HTMLVideoElement | null = null;

export function requestPlay(video: HTMLVideoElement) {
  if (currentlyPlaying && currentlyPlaying !== video) {
    currentlyPlaying.pause();
  }
  currentlyPlaying = video;
  video.play().catch(() => {
    // Autoplay can be blocked by the browser; fail silently and rely on
    // the poster image fallback (DESIGN.md §8).
  });
}

export function releaseIfCurrent(video: HTMLVideoElement) {
  if (currentlyPlaying === video) {
    currentlyPlaying = null;
  }
}
