// Shown instantly during category-filter navigation before the server
// re-renders the work list. Matches the masonry layout structure so
// there is no visual jump when real content arrives.
export default function GalleryLoading() {
  return (
    <main>
      {/* Header skeleton */}
      <div className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-5 sm:px-8">
          <div className="h-6 w-44 rounded bg-canvas animate-pulse" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-[1400px] gap-x-6 px-5 py-4 sm:px-8">
          {[72, 28, 64, 52, 80, 44].map((w, i) => (
            <div
              key={i}
              className="h-4 rounded bg-canvas animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>

      {/* Masonry skeleton — 12 cards in 4 columns */}
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
        <div className="columns-2 gap-5 sm:columns-3 lg:columns-4">
          {[1.2, 0.75, 1.5, 0.9, 1.1, 1.8, 0.65, 1.3, 1.0, 0.8, 1.4, 1.6].map(
            (ratio, i) => (
              <div key={i} className="mb-5 break-inside-avoid">
                <div
                  className="w-full rounded-card bg-canvas animate-pulse"
                  style={{ aspectRatio: ratio }}
                />
                <div className="mt-2 flex justify-between gap-3">
                  <div className="h-3 w-28 rounded bg-canvas animate-pulse" />
                  <div className="h-3 w-14 rounded bg-canvas animate-pulse" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
