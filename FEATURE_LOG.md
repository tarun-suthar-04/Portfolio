# FEATURE_LOG.md

> **Purpose:** A chronological, append-only record of major decisions, features, fixes, and changes. Every meaningful future change (feature, fix, architecture/design decision, dependency change, database change, security change, UX change) must be logged here with a new entry. Do not edit or delete past entries â€” append corrections as new entries instead.

---

## 2026-09-07 â€” Foundational Project & Architecture Decisions

**Type:** Architecture / Product Decision
**Status:** Approved

**Summary:**
Initial project direction and architecture approved, prior to any implementation. This entry captures the foundational decisions made during the documentation stage.

**Decisions recorded:**

1. **Creative-first scope.** The project launches as a creative visual-work showcase only. No developer/software-engineering portfolio content is included in the current version.
2. **Digital archive / exhibition experience.** The site is designed as a curated digital exhibition rather than a traditional portfolio layout.
3. **Pinterest-style masonry gallery** adopted as the homepage layout, preserving native media aspect ratios.
4. **Data-driven category filtering.** Categories are stored in the database and managed via the Admin Panel â€” never hardcoded in the UI.
5. **Immersive click-to-view work viewer**, implemented via a route that is both a shareable, direct URL (`/work/[slug]`) and an in-app modal/intercepted route experience from the gallery.
6. **Viewport-aware autoplay video previews**, with only one video playing at a time across the gallery.
7. **Multi-media project data model** approved: a `WORK` may contain 1 to N `MEDIA` items; the UI must simplify automatically for single-media works.
8. **Mobile-friendly Admin Panel** is a hard requirement, including practical media upload directly from a phone.
9. **Supabase** (PostgreSQL + Auth + Row Level Security) approved as the backend/data/auth layer.
10. **Cloudinary** approved as the media storage, transformation, and CDN layer; Supabase stores only metadata/references, never binary media.
11. **Future-proof architecture** confirmed as a requirement: new creative work must be addable without any code change, via the Admin Panel.
12. **No developer portfolio in current scope** â€” explicitly deferred to a possible future section/version.

**Rationale:**
These decisions optimize for the stated primary goal â€” enabling a visitor, recruiter, or client to browse and understand the creative work as quickly and visually as possible â€” while keeping the system simple, low-cost, and maintainable for a single admin.

**Impact:**
Establishes the baseline described in `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CODING_RULES.md`, and `FEATURES.md`. No code has been written as of this entry.

---

## 2026-09-08 â€” Initial Next.js Scaffold: Public Gallery, Viewer, Admin Shell

**Type:** Feature / Architecture Decision

**Status:** Implemented

**Summary:**
First application code committed. Built the Next.js App Router scaffold covering:
- Public masonry gallery (CSS-columns based) with data-driven category filtering via URL query params.
- Immersive work viewer implemented as an intercepted parallel route (`@modal`) for in-app clicks, plus a standalone `/work/[slug]` page for direct/shared links, per `ARCHITECTURE.md` Â§2.3.
- Viewport-aware, single-video-at-a-time autoplay for gallery video cards (`lib/activeVideoRegistry.ts`).
- Multi-media project support in the viewer (thumbnail strip only rendered when a work has more than one media item).
- SEO basics: per-work metadata/Open Graph, `sitemap.ts`, `robots.ts` excluding `/admin`.
- Admin shell: Supabase Auth-gated `(protected)` route group, login page, works dashboard, work create/edit form (metadata only), categories list page, settings placeholder.
- Supabase server/browser client factories and a Cloudinary signed-upload helper, ready to be wired in.
- A temporary in-memory mock data layer (`lib/data/mockWorks.ts`) standing in for real Supabase queries, matching the exact function signatures the real data-access layer will use.

**Rationale:**
Establishes the real project structure and interaction patterns (masonry, filtering, viewer routing, video autoplay, auth-gating) end-to-end before connecting live Supabase/Cloudinary services, so the architecture in `ARCHITECTURE.md` is validated in code early.

**Impact:**
- `FEATURES.md`: gallery, filtering, viewer, video autoplay, multi-media, and admin shell items move from `PLANNED` to `IMPLEMENTED` (UI/structure) â€” see that file for exact per-feature status. Persistence-dependent features (real save/upload/publish) remain `PLANNED` until Supabase/Cloudinary are connected.
- `PROJECT_REPORT.md`: updated to reflect this as the current implementation state.
- No architecture or stack decisions were changed from what was already approved in `ARCHITECTURE.md`.

**Known gaps at this stage (tracked, not yet built):**
- No real Supabase project connected â€” `lib/data/mockWorks.ts` is a placeholder for `lib/data/works.ts` / `lib/data/categories.ts`.
- No RLS policies applied yet (none exist until a Supabase project + schema migration exist).
- No Cloudinary upload UI wired into the admin work form yet (`getUploadSignature` exists but is unused).
- Category management (create/rename/reorder/remove) is display-only in the admin UI.
- No automated tests yet.

<!--
TEMPLATE FOR FUTURE ENTRIES â€” copy this block for each new log entry.

## YYYY-MM-DD â€” <Short Title>

**Type:** Feature / Fix / Architecture Decision / Product Decision / Design Decision / Dependency Change / Database Change / Security Change / UX Change

**Status:** Proposed / Approved / Implemented / Reverted

**Summary:**
<What changed or was decided, in a sentence or two.>

**Rationale:**
<Why this decision was made.>

**Impact:**
<What documents/files/areas of the system this affects. Note if PROJECT_CONTEXT.md, ARCHITECTURE.md, DESIGN.md, CODING_RULES.md, or FEATURES.md needed updates as a result.>
-->

## 2026-10-12 â€” Signed media uploads in the admin work form

**Type:** Feature / Security Change

**Status:** Implemented

**Summary:** Added a multi-file image/video uploader for saved works. The server signs uploads into a per-work Cloudinary folder, validates admin access and returned asset metadata, and inserts ordered media rows through the user's Supabase session. New works are saved as drafts first, and publishing requires at least one media item.

**Rationale:** Complete the next implementation milestone in the project report while preserving the Cloudinary secret and Supabase RLS boundaries.

**Impact:** Updated `WorkForm`, Cloudinary signing, admin Server Actions, public media ordering, `FEATURES.md`, `PROJECT_REPORT.md`, and `README.md`. Live Cloudinary credentials and end-to-end upload verification are still required; media deletion, reordering, and alt-text editing remain future work.

## 2026-10-12 — Full Project Audit, DB Security Fix, .md Doc Updates

**Type:** Security Change / Fix / Feature Log

**Status:** Implemented (partial — see notes)

**Summary:**
Full codebase + live database audit performed via Supabase MCP. Identified that migration `0002_admin_role_policies.sql` had not been applied to the live database — any authenticated Supabase user could insert/update/delete works, media, and categories. Two conflicting SELECT policies on `public.work` also allowed authenticated non-admin users to read draft works. All .md documentation files updated to reflect the accurate implementation state.

**Issues Confirmed:**
- **CRITICAL (DB):** `0002_admin_role_policies.sql` not applied to live database. Old permissive policies active.
- **CRITICAL (DB):** Duplicate SELECT policies on `work` — drafts leaked to all authenticated users.
- **High:** `app/sitemap.ts` uses mock data; live published works not in sitemap.
- **High:** `MediaFrame` uses raw `<img>` instead of `next/image` — no WebP, no srcset, no LCP.
- **High:** `WorkContent` is a Client Component for no current reason (no keyboard listeners yet).
- **High:** `CategoryFilter` uses `useSearchParams` — blocks gallery streaming without Suspense.
- **Medium:** No media delete, reorder, or alt-text editing in admin.
- **Medium:** No confirm-before-delete for works.
- **Medium:** No gallery loading state (loading.tsx).
- **Security:** Leaked Password Protection disabled in Supabase Auth.

**Rationale:**
Regular audit pass to ensure the live database security posture matches the code, and to bring all documentation up to date before further feature development.

**Impact:**
- `PROJECT_REPORT.md`: Updated with accurate current state, live DB audit findings, and priority roadmap.
- `FEATURES.md`: Updated — items connected to live Supabase data marked IMPLEMENTED; new PLANNED items added for media delete/reorder, confirm-delete, sitemap fix, publish toggle, alt-text, gallery skeleton, lazy video src.
- Migration `0002` must be applied manually via Supabase SQL Editor (MCP auto-cancelled destructive DDL).
- No code changes in this session.
