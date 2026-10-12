# PROJECT_REPORT.md

_Last updated: 2026-10-12_

## Current Status

The Next.js 15 application has a fully-wired public gallery, work viewer, intercepted-modal route, Supabase-backed data layer, RLS-protected database, protected admin routes (with first-admin registration), work/category management, and signed Cloudinary upload for images and videos.

TypeScript passes cleanly (`tsc --noEmit` exit 0). The production build compiles all 12 routes with no errors. Migration `0002_admin_role_policies.sql` applied to the live database on 2026-10-12 — all write operations are now restricted to the `admin` role claim.

---

## What Is Done

| Area | Status |
|---|---|
| Public masonry gallery (CSS-columns, responsive) | Done |
| Data-driven category filter (URL query param) | Done |
| Click-to-view modal + shareable /work/[slug] URL | Done |
| Viewport-aware single-video autoplay | Done |
| Multi-media work viewer (thumbnail strip, prev/next nav) | Done |
| Per-work Open Graph metadata, sitemap, robots.txt | Done (sitemap uses mock data — see gaps) |
| Supabase schema + RLS (migrations 0001 + 0002) | Done — both applied to live DB as of 2026-10-12 |
| Admin login / logout | Done |
| First-admin one-time registration (/admin/register) | Done |
| Admin works dashboard (list + publish status badge) | Done |
| Admin work create/edit form (metadata + status) | Done |
| Admin signed Cloudinary upload (images + videos) | Done |
| Admin category create/delete with inline error | Done |
| Media metadata saved to Supabase after upload | Done |
| Work delete (cascades media) | Done |

---

## Known Gaps & Issues

### Critical

1. app/sitemap.ts uses mock data — published works from Supabase do not appear in the sitemap.

### High (Functional Gaps)

2. No media delete, reorder, or alt-text editing in the admin.
3. No drag-to-reorder works (display_order exists but no visual UI).
4. Category description field is in the DB but unused — no admin UI, not displayed publicly.
5. No confirm dialog before deleting a work.
6. No publish/unpublish toggle in the admin works list row.

### Medium (UX / Performance)

7. MediaFrame uses raw img element instead of next/image — no WebP, no srcset, no LCP optimization.
8. WorkContent is a Client Component with no keyboard listeners yet.
9. CategoryFilter uses useSearchParams — needs Suspense boundary to allow gallery streaming.
10. No gallery loading state (loading.tsx).
11. Video src loads on all gallery cards at once — no lazy-loading of video source.
12. Leaked Password Protection disabled in Supabase Auth settings.

### Low

13. lib/data/mockWorks.ts still imported at the top of works.ts.
14. No ESLint config committed.
15. Category display_order not editable via admin.
16. No toast/notification system.

---

## Suggested Priority Order for Next Work

1. Fix app/sitemap.ts to query live Supabase published works.
2. Swap MediaFrame to use next/image (biggest single performance win).
3. Add loading.tsx for gallery + wrap CategoryFilter in Suspense.
4. Add media delete + reorder in admin.
5. Add confirm-before-delete for works.
6. Enable Leaked Password Protection in Supabase Auth settings.
7. Convert WorkContent back to Server Component; add keyboard nav as a micro Client Component.
8. Add publish toggle in the admin works list.
