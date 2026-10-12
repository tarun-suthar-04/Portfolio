# Tarun Visual Works — Full Project Analysis
_Analyzed: 2026-10-12 | TypeScript: 0 errors | Build: passing_

---

## 🔴 Critical Issues (Fix First)

### 1. Migration `0002` Policy Effects Active; Migration Ledger Is Empty

**Checked against the live Supabase project on 2026-10-12.** The active policies on `work`, `media`, and `category` match the security intent of `0002_admin_role_policies.sql`: writes require `app_metadata.role = 'admin'`, admins can read drafts, and public reads are restricted to published work/media. RLS is enabled on all three tables. The old unrestricted authenticated policies are absent.

The policies were applied manually in the SQL Editor, but `supabase_migrations.schema_migrations` contains no recorded migrations (the Supabase migration-list tool also returned an empty list). The live security change is active but untracked by migration history. Do not re-run `0002` blindly; reconcile migration history through the Supabase CLI when the repository is linked, after confirming the local `0001` and `0002` files match the live schema.

---

### 2. Draft Leakage — Resolved by Active Policies

Live policy inspection found no broad authenticated SELECT policy. `work` has a public `status = 'published'` policy and a separate admin-only policy for reading all works. `media` is readable when its work is published or the caller is an admin.

---

### 3. Sitemap Fetch and Canonical URL Need Review

`app/sitemap.ts` now queries Supabase for published works in the current working tree. It still silently ignores returned query errors and falls back to `https://example.com` if `NEXT_PUBLIC_SITE_URL` is missing, which can produce an incorrect sitemap. Review and fix those failure cases.

---

## 🟠 High Priority Issues

### 4. `MediaFrame` Uses `<img>` Instead of `next/image`

[MediaFrame.tsx](file:///C:/Users/ASUS/Downloads/tarun-visual-works/components/gallery/MediaFrame.tsx) renders a raw `<img>` with an ESLint disable comment. This means:
- No automatic WebP/AVIF conversion from Cloudinary
- No `srcset` / `sizes` — full-resolution images load on mobile
- No LCP prioritization (the `priority` prop passed from `WorkContent` is silently ignored)
- No built-in lazy loading for below-the-fold images

This is the single biggest performance win available.

### 5. `WorkContent` Is a Client Component for No Current Reason

[WorkContent.tsx](file:///C:/Users/ASUS/Downloads/tarun-visual-works/components/viewer/WorkContent.tsx) is `"use client"` because it was planned for keyboard shortcuts (prev/next arrow keys), but **no `keydown` listener exists**. The entire work detail content — title, description, metadata, related works — is rendered as a client bundle instead of a static server-rendered HTML page.

### 6. `CategoryFilter` Blocks Gallery Streaming

[CategoryFilter.tsx](file:///C:/Users/ASUS/Downloads/tarun-visual-works/components/gallery/CategoryFilter.tsx) uses `useSearchParams()`, which means the entire page tree must wait for the client to hydrate before the filter renders. It needs a `<Suspense>` boundary in the homepage, or be restructured to derive the active state from a server prop.

### 7. Confirm Before Deleting a Work — Implemented in Working Tree

The edit page now asks the admin to confirm the work title and cascading media deletion before submitting. The change is in the current working tree and has not been browser-verified.

### 8. No Media Delete / Reorder

Once uploaded, a media item cannot be removed or reordered. The `display_order` column exists but the admin has no UI for it.

---

## 🟡 Medium Priority (UX / DX)

### 9. No Gallery Loading State (`loading.tsx`)

Clicking a category filter triggers a server round-trip with zero visual feedback. No skeleton cards, no spinner.

### 10. No Publish/Unpublish Toggle in Works List

To publish a draft, the admin must open the full edit form, change the status dropdown, and save. A single toggle button in the list row would be faster.

### 11. No Admin-Side Work Search / Filter

With many works, the admin list becomes hard to navigate. There's no search, status filter, or category filter in `/admin/works`.

### 12. `display_order` Not Editable for Categories

Categories can be created and deleted, but their order in the filter bar is fixed at insertion time. There's no UI to reorder them.

### 13. Video `src` Loads on All Cards at Once

`GalleryVideo` sets `src={media.url}` on every video card in the masonry grid. Even with `preload="metadata"`, browsers send a network request per video. The `IntersectionObserver` only handles play/pause, not lazy-loading the source.

### 14. Leaked Password Protection Disabled (Supabase Auth)

Supabase advisor flagged that HaveIBeenPwned password checking is disabled in the Auth settings.

---

## ✨ Features to Implement (Priority Order)

### Immediate

| # | Feature | Effort |
|---|---|---|
| A | Reconcile the manually applied `0002` with migration history | Check local files against live DB before recording history |
| B | Swap `MediaFrame` to `next/image` | Implemented in working tree; review and verify |
| C | Query Supabase for published works in `sitemap.ts` | Implemented in working tree; review and verify |
| D | Wrap `CategoryFilter` in `<Suspense>` on homepage | Implemented in working tree; review and verify |
| E | Enable leaked-password protection in Supabase Auth | 2 min |

### Short-term

| # | Feature | Notes |
|---|---|---|
| F | Gallery `loading.tsx` skeleton | Use CSS `columns` skeleton cards matching masonry layout |
| G | Convert `WorkContent` back to Server Component | Extract only the keyboard shortcut part to a tiny Client Component |
| H | Confirm-before-delete for works | Implemented in working tree; review and verify |
| I | Media delete | Admin action + revalidate; Cloudinary `destroy` via SDK |
| J | Media reorder | Drag-and-drop or up/down buttons on each media thumbnail |
| K | Publish/unpublish toggle in works list | Single `<form>` per row calling a `togglePublish` server action |
| L | Lazy-load video `src` | Set `src` only when `IntersectionObserver` fires, not on mount |
| M | Alt-text editing for media | Input per media item in MediaUploader; `updateMediaAltText` action |

### Medium-term

| # | Feature | Notes |
|---|---|---|
| N | Admin works search + status filter | Client-side filter over the fetched list, or a URL param |
| O | Category reorder | Drag-and-drop list; `updateCategoryOrder` action writing `display_order` |
| P | Category description | Text area in category edit; rendered as a subtitle on the filter bar |
| Q | Featured works section | Query `featured = true` on the homepage, pin to top of masonry |
| R | Work tags / tools filter | Expose `tools_used` array as public filter pills |
| S | Contact / inquiry form | Simple form → email via Resend or Supabase Edge Function |
| T | Dark mode | CSS custom properties already use named tokens (`--paper`, `--ink`); swap them in `prefers-color-scheme: dark` |
| U | OG image generation | Use `next/og` to auto-generate per-work social preview images from the primary media |

### Future / Nice-to-have

| # | Feature | Notes |
|---|---|---|
| V | Analytics | Plausible or Vercel Analytics (privacy-respecting, no cookies) |
| W | Keyboard navigation in viewer | Arrow keys for prev/next (Client Component shell already present) |
| X | Password-protected works | `status = 'private'` + token-gated access for client review links |
| Y | Bulk-upload from admin | Upload multiple works in one go, each becomes a new draft |
| Z | Automated tests | Vitest unit tests for data mappers; Playwright for the gallery + viewer flow |

---

## ⚡ Performance Improvements (How to Make It Fast)

### 1. Image Optimization (Biggest Win)
Replace `<img>` with `next/image` in `MediaFrame`. Use:
```tsx
<Image
  src={media.url}
  alt={media.altText ?? ""}
  width={media.width}  // add width/height to Media type + DB schema
  height={media.height}
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  priority={priority}  // set on the primary media in WorkContent
  className="w-full rounded-card"
/>
```
This enables: lazy loading, WebP auto-conversion via Cloudinary + Next.js, `srcset`, LCP optimization.

### 2. Gallery Streaming
Add `app/(public)/loading.tsx` with skeleton cards matching the masonry layout. Wrap `<CategoryFilter>` in `<Suspense fallback={<FilterSkeleton />}>` on the homepage so the skeleton renders immediately on navigation.

### 3. Video Lazy-Loading
In `GalleryVideo`, only assign `src` after the IntersectionObserver fires:
```tsx
const [src, setSrc] = useState<string | undefined>(undefined);
// In the observer callback:
if (entry.isIntersecting) setSrc(media.url);
```

### 4. Add Missing DB Index
The `idx_work_category_id` index exists but the Supabase advisor says it's unused. This will be used once category-filtered queries run in production. Keep it — it will matter with real data.

### 5. Move `WorkContent` to a Server Component
Server-rendering the work title, description, and metadata HTML saves ~20 KB of JS hydration per page view and makes the work detail page appear faster on slow networks.

### 6. HTTP Cache Headers
In `next.config.js`, add `headers()` to set `Cache-Control: public, max-age=31536000, immutable` on Cloudinary-served images (they already have unique URLs). The Next.js ISR `revalidate` export can also be added to the public gallery page for edge caching.

---

## .md Files Audit

| File | Status |
|---|---|
| `README.md` | Up to date |
| `ARCHITECTURE.md` | Up to date |
| `DESIGN.md` | Up to date |
| `CODING_RULES.md` | Up to date |
| `FEATURES.md` | **Needs update** — several items marked `PLANNED` are now `IMPLEMENTED` |
| `PROJECT_CONTEXT.md` | Up to date |
| `FEATURE_LOG.md` | **Needs a new entry** for this analysis session |
| `PROJECT_REPORT.md` | **Updated** (see companion file) |
