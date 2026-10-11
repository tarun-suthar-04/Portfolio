# FEATURE_LOG.md

> **Purpose:** A chronological, append-only record of major decisions, features, fixes, and changes. Every meaningful future change (feature, fix, architecture/design decision, dependency change, database change, security change, UX change) must be logged here with a new entry. Do not edit or delete past entries — append corrections as new entries instead.

---

## 2026-09-07 — Foundational Project & Architecture Decisions

**Type:** Architecture / Product Decision
**Status:** Approved

**Summary:**
Initial project direction and architecture approved, prior to any implementation. This entry captures the foundational decisions made during the documentation stage.

**Decisions recorded:**

1. **Creative-first scope.** The project launches as a creative visual-work showcase only. No developer/software-engineering portfolio content is included in the current version.
2. **Digital archive / exhibition experience.** The site is designed as a curated digital exhibition rather than a traditional portfolio layout.
3. **Pinterest-style masonry gallery** adopted as the homepage layout, preserving native media aspect ratios.
4. **Data-driven category filtering.** Categories are stored in the database and managed via the Admin Panel — never hardcoded in the UI.
5. **Immersive click-to-view work viewer**, implemented via a route that is both a shareable, direct URL (`/work/[slug]`) and an in-app modal/intercepted route experience from the gallery.
6. **Viewport-aware autoplay video previews**, with only one video playing at a time across the gallery.
7. **Multi-media project data model** approved: a `WORK` may contain 1 to N `MEDIA` items; the UI must simplify automatically for single-media works.
8. **Mobile-friendly Admin Panel** is a hard requirement, including practical media upload directly from a phone.
9. **Supabase** (PostgreSQL + Auth + Row Level Security) approved as the backend/data/auth layer.
10. **Cloudinary** approved as the media storage, transformation, and CDN layer; Supabase stores only metadata/references, never binary media.
11. **Future-proof architecture** confirmed as a requirement: new creative work must be addable without any code change, via the Admin Panel.
12. **No developer portfolio in current scope** — explicitly deferred to a possible future section/version.

**Rationale:**
These decisions optimize for the stated primary goal — enabling a visitor, recruiter, or client to browse and understand the creative work as quickly and visually as possible — while keeping the system simple, low-cost, and maintainable for a single admin.

**Impact:**
Establishes the baseline described in `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CODING_RULES.md`, and `FEATURES.md`. No code has been written as of this entry.

---

## 2026-09-08 — Initial Next.js Scaffold: Public Gallery, Viewer, Admin Shell

**Type:** Feature / Architecture Decision

**Status:** Implemented

**Summary:**
First application code committed. Built the Next.js App Router scaffold covering:
- Public masonry gallery (CSS-columns based) with data-driven category filtering via URL query params.
- Immersive work viewer implemented as an intercepted parallel route (`@modal`) for in-app clicks, plus a standalone `/work/[slug]` page for direct/shared links, per `ARCHITECTURE.md` §2.3.
- Viewport-aware, single-video-at-a-time autoplay for gallery video cards (`lib/activeVideoRegistry.ts`).
- Multi-media project support in the viewer (thumbnail strip only rendered when a work has more than one media item).
- SEO basics: per-work metadata/Open Graph, `sitemap.ts`, `robots.ts` excluding `/admin`.
- Admin shell: Supabase Auth-gated `(protected)` route group, login page, works dashboard, work create/edit form (metadata only), categories list page, settings placeholder.
- Supabase server/browser client factories and a Cloudinary signed-upload helper, ready to be wired in.
- A temporary in-memory mock data layer (`lib/data/mockWorks.ts`) standing in for real Supabase queries, matching the exact function signatures the real data-access layer will use.

**Rationale:**
Establishes the real project structure and interaction patterns (masonry, filtering, viewer routing, video autoplay, auth-gating) end-to-end before connecting live Supabase/Cloudinary services, so the architecture in `ARCHITECTURE.md` is validated in code early.

**Impact:**
- `FEATURES.md`: gallery, filtering, viewer, video autoplay, multi-media, and admin shell items move from `PLANNED` to `IMPLEMENTED` (UI/structure) — see that file for exact per-feature status. Persistence-dependent features (real save/upload/publish) remain `PLANNED` until Supabase/Cloudinary are connected.
- `PROJECT_REPORT.md`: updated to reflect this as the current implementation state.
- No architecture or stack decisions were changed from what was already approved in `ARCHITECTURE.md`.

**Known gaps at this stage (tracked, not yet built):**
- No real Supabase project connected — `lib/data/mockWorks.ts` is a placeholder for `lib/data/works.ts` / `lib/data/categories.ts`.
- No RLS policies applied yet (none exist until a Supabase project + schema migration exist).
- No Cloudinary upload UI wired into the admin work form yet (`getUploadSignature` exists but is unused).
- Category management (create/rename/reorder/remove) is display-only in the admin UI.
- No automated tests yet.

<!--
TEMPLATE FOR FUTURE ENTRIES — copy this block for each new log entry.

## YYYY-MM-DD — <Short Title>

**Type:** Feature / Fix / Architecture Decision / Product Decision / Design Decision / Dependency Change / Database Change / Security Change / UX Change

**Status:** Proposed / Approved / Implemented / Reverted

**Summary:**
<What changed or was decided, in a sentence or two.>

**Rationale:**
<Why this decision was made.>

**Impact:**
<What documents/files/areas of the system this affects. Note if PROJECT_CONTEXT.md, ARCHITECTURE.md, DESIGN.md, CODING_RULES.md, or FEATURES.md needed updates as a result.>
-->
