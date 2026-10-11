# ARCHITECTURE.md

> **Status:** Planned architecture. Nothing described here has been implemented yet. See `PROJECT_REPORT.md` for actual build status.

---

## 1. High-Level Architecture

```
                        ┌─────────────────────────┐
                        │        Visitor           │
                        └────────────┬─────────────┘
                                     │ HTTPS
                                     ▼
                        ┌─────────────────────────┐
                        │   Next.js App (Vercel/   │
                        │   Cloudflare)             │
                        │  - Server Components      │
                        │  - Client Components      │
                        │  - Server Actions / API   │
                        └───────┬───────────┬───────┘
                                │           │
                 Metadata/Auth  │           │  Media URLs / uploads
                                ▼           ▼
                  ┌────────────────────┐  ┌───────────────────────┐
                  │  Supabase           │  │  Cloudinary            │
                  │  - PostgreSQL       │  │  - Image/video storage │
                  │  - Auth             │  │  - Transformations     │
                  │  - Row Level        │  │  - CDN delivery        │
                  │    Security (RLS)   │  │                        │
                  └────────────────────┘  └───────────────────────┘
```

- The Next.js application is the single application layer, serving both the public gallery and the Admin Panel.
- Supabase is the system of record for structured data (categories, works, media metadata, admin users) and handles authentication.
- Cloudinary is the system of record for actual media bytes and handles transformations/CDN delivery. Supabase never stores binary media.

---

## 2. Frontend Architecture

### 2.1 Framework
- Next.js with the **App Router**.
- TypeScript throughout.
- Tailwind CSS for styling; shadcn/ui components used selectively, primarily in the Admin Panel (forms, dialogs, tables, dropdowns).
- Motion library for transitions (viewer open/close, filter transitions, hover states).

### 2.2 Route Structure (Planned)

**Public site:**
```
/                          → Homepage: masonry gallery, category filter
/work/[slug]               → Immersive work viewer (dedicated, shareable route)
/category/[slug]           → Optional: gallery pre-filtered by category (SEO-friendly variant)
```

**Admin (all under a protected segment):**
```
/admin                     → Redirect to dashboard or login
/admin/login               → Admin login
/admin/works               → List all works (draft + published)
/admin/works/new           → Create new work
/admin/works/[id]          → Edit existing work (metadata + media)
/admin/categories          → Manage categories (create/rename/reorder/remove)
/admin/settings            → Admin/account settings
```

### 2.3 Work Viewer Routing Approach

The work viewer must give the best UX while preserving shareable URLs. Approach:

- Each work has a **dedicated route**: `/work/[slug]`, which server-renders full metadata (for SEO, social sharing, and direct linking).
- When a visitor clicks a work **from the gallery**, the viewer opens as an **intercepted route / modal-over-gallery** (Next.js parallel/intercepting routes pattern), so the gallery stays visually present behind it and the URL updates to `/work/[slug]` without a full page reload.
- Direct navigation to `/work/[slug]` (e.g., from a shared link) renders the full standalone page (gallery not required as backdrop).
- This gives: instant, app-like modal browsing during a session, plus fully shareable, crawlable, direct URLs.

### 2.4 Component Structure (Conceptual, not final file layout)

```
app/
  (public)/
    page.tsx                  → Homepage gallery (Server Component, fetches works)
    work/[slug]/page.tsx      → Standalone work viewer page
    @modal/(.)work/[slug]/    → Intercepted modal route for in-app viewer
  admin/
    layout.tsx                → Auth-gated admin layout
    login/page.tsx
    works/page.tsx
    works/new/page.tsx
    works/[id]/page.tsx
    categories/page.tsx
    settings/page.tsx

components/
  gallery/
    MasonryGrid.tsx           (Client — needs layout measurement/interaction)
    GalleryCard.tsx           (Client — hover/video preview behavior)
    CategoryFilter.tsx        (Client — filter state + smooth transition)
  viewer/
    WorkViewer.tsx            (Client — navigation, media playback, gestures)
    MediaDisplay.tsx
    RelatedWork.tsx
  admin/
    WorkForm.tsx
    MediaUploader.tsx
    CategoryManager.tsx
  ui/
    (shadcn/ui-based primitives: Button, Dialog, Input, Select, etc.)
```

### 2.5 Server vs Client Component Strategy

- **Default to Server Components.** Data fetching (works, categories, media metadata) happens in Server Components wherever possible.
- **Client Components are used only where interaction requires it:**
  - Masonry grid layout logic (measuring/positioning in the browser).
  - Category filter (instant, non-reloading UI state).
  - Work viewer navigation (prev/next, keyboard/gesture handling).
  - Video playback (viewport detection, play/pause control).
  - All Admin Panel forms and upload interactions.
- Server Actions (or Route Handlers where a Server Action doesn't fit, e.g., signed upload requests) are used for all mutations: creating/editing/deleting works, managing categories, handling publish/unpublish.

---

## 3. Supabase

### 3.1 Responsibilities
- Store all structured data: admin users, categories, works/projects, media metadata, tags.
- Provide authentication for the single admin (email/password or magic link — final method to be decided at implementation, recorded in `FEATURE_LOG.md`).
- Enforce authorization via Row Level Security policies.

### 3.2 Database Schema (Conceptual)

```
CATEGORY
  id              uuid (pk)
  name            text
  slug            text (unique)
  description     text (nullable)
  display_order   integer
  created_at      timestamptz
  updated_at      timestamptz

WORK  (a "project" — may contain 1..N media items)
  id              uuid (pk)
  title           text
  slug            text (unique)
  description     text (nullable)
  category_id     uuid (fk → CATEGORY.id)
  status          text  -- 'draft' | 'published'
  featured        boolean
  tools_used      text[] (nullable)   -- e.g. ['Canva', 'CapCut']
  display_order   integer
  created_at      timestamptz
  updated_at      timestamptz

MEDIA
  id              uuid (pk)
  work_id         uuid (fk → WORK.id)
  type            text  -- 'image' | 'video'
  url             text                -- Cloudinary secure URL
  thumbnail_url   text (nullable)     -- Cloudinary-generated poster/thumbnail
  public_id       text                -- Cloudinary public_id, for management/transformations
  alt_text        text (nullable)
  caption         text (nullable)
  duration        numeric (nullable)  -- seconds, for video
  display_order   integer
  created_at      timestamptz

TAG            (optional — only if tag-based browsing/filtering proves useful)
  id              uuid (pk)
  name            text (unique)

WORK_TAG       (optional join table, only if TAG is used)
  work_id         uuid (fk → WORK.id)
  tag_id          uuid (fk → TAG.id)

ADMIN_USER      -- typically Supabase's built-in auth.users, extended via a profile table if role distinction is needed
  id              uuid (pk, = auth.users.id)
  email           text
  role            text  -- 'admin' (single role in current scope)
```

**Recommended adjustments to the initial field list provided in the brief:**
- `tools_used` is modeled as a simple text array on `WORK` rather than a separate join table — the brief doesn't call for reusable/filterable "tools" the way categories/tags are, so a join table would add complexity without a clear benefit. This can be revisited if tools ever need their own filtering UI.
- `TAG` / `WORK_TAG` are explicitly optional, as stated in the brief — implement only when tag-based browsing is actually needed, to avoid unnecessary schema complexity up front.
- An `ADMIN_USER` profile table is only needed if role differentiation beyond Supabase's default `auth.users` becomes necessary; for a single admin, Supabase Auth alone may be sufficient.

### 3.3 Relationships

```
CATEGORY (1) ───< (many) WORK
WORK     (1) ───< (many) MEDIA
WORK     (many) ───< WORK_TAG >─── (many) TAG      [optional]
```

### 3.4 Row Level Security (Conceptual Policies)

- **CATEGORY / WORK / MEDIA — SELECT:**
  - Public (anon) role: allowed to read rows where the related `WORK.status = 'published'`.
  - Authenticated admin: allowed to read all rows regardless of status.
- **CATEGORY / WORK / MEDIA — INSERT / UPDATE / DELETE:**
  - Only the authenticated admin role may perform these operations.
  - No anonymous write access under any circumstance.
- RLS must be enabled on every table from the start; no table is left open by default.

---

## 4. Authentication & Authorization

- Supabase Auth manages the admin's login session (email/password or magic link).
- The Next.js `admin` route segment is protected by:
  1. A layout-level server-side session check that redirects unauthenticated requests to `/admin/login`.
  2. RLS policies as the ultimate enforcement layer — the UI check is a UX convenience, not the security boundary.
- No client-side-only authentication gate is acceptable as a sole protection mechanism.

---

## 5. Cloudinary & Upload Flow

### 5.1 Responsibilities
- Stores and serves all image/video assets.
- Generates thumbnails/posters, responsive transformations, and optimized formats automatically.
- Serves media via CDN.

### 5.2 Upload Flow (Conceptual)

```
Admin (browser)
   │  1. Requests a signed upload signature
   ▼
Next.js Server Action / Route Handler
   │  2. Generates a signed payload using server-only Cloudinary API secret
   ▼
Admin (browser)
   │  3. Uploads file directly to Cloudinary using the signed payload
   ▼
Cloudinary
   │  4. Returns secure_url, public_id, thumbnail data
   ▼
Admin (browser)
   │  5. Sends returned metadata to a Server Action
   ▼
Next.js Server Action
   │  6. Writes MEDIA row (url, public_id, thumbnail_url, type, etc.) into Supabase
```

- The Cloudinary API secret is **never** sent to or used in the browser. Only a short-lived signature is generated server-side.
- Deleting a work/media item should also trigger cleanup of the corresponding Cloudinary asset (implementation detail to confirm at build time; must be recorded if deferred).

---

## 6. Gallery Data Flow

1. Homepage (Server Component) fetches published `WORK` rows (with their primary/first `MEDIA` item and `CATEGORY`) from Supabase, ordered by `display_order` / `featured` / `created_at` as designed.
2. Data is passed to the `MasonryGrid` Client Component for layout rendering.
3. Category filter changes update client-side state; depending on implementation, this either:
   - filters an already-fetched full work list client-side (suitable while work count is moderate), or
   - triggers a lightweight re-fetch scoped to the category (better for large catalogs).
   - **Decision on which approach to use should be made and recorded at implementation time** based on expected catalog size; both must avoid full-page reloads.
4. No SQL or Supabase client calls occur inside presentation components — all data fetching lives in Server Components, Server Actions, or a dedicated data-access layer.

---

## 7. Category Filtering

- Categories are fully data-driven, sourced from the `CATEGORY` table — never hardcoded in UI components.
- The gallery's "All" view is a UI-level concept (not necessarily a database row) representing "no category filter applied."
- Filtering triggers a smooth, non-blocking UI transition (Motion) rather than a full navigation, per `PROJECT_CONTEXT.md` UX decisions.

---

## 8. Work Viewer

- Displays: media (image/video), title, category, media type, description, tools used, date, tags, and previous/next navigation, plus related work.
- Previous/next navigation moves between works (or between media items within a multi-media work — exact interaction to be finalized during design/build, but the underlying data model already supports both).
- Related work is computed by shared category (and/or tags, if tags are implemented).

---

## 9. Video Autoplay Behavior

- Implemented via an `IntersectionObserver`-based Client Component wrapper around each video element.
- Rules:
  - Video plays muted automatically only when sufficiently within the viewport.
  - Video pauses immediately when it leaves the viewport threshold.
  - Only one video plays at a time in the gallery view (a simple registry/context tracks the "currently playing" video and pauses others).
  - Poster/thumbnail image is shown until playback begins or as a fallback if autoplay is blocked by the browser.

---

## 10. Draft / Publish Flow

- `WORK.status` is either `draft` or `published`.
- Public queries (anon RLS role) only ever return `published` works.
- Admin queries return both, with visual indicators distinguishing drafts in `/admin/works`.
- Publishing/unpublishing is a status update via a Server Action, gated by the admin auth check and RLS.

---

## 11. Multi-Media Projects

- A `WORK` has a one-to-many relationship with `MEDIA`, ordered by `display_order`.
- UI must simplify automatically when `MEDIA.count === 1` (e.g., no thumbnail strip/sub-navigation needed) and reveal a media browser (e.g., thumbnail strip or paged view) when `MEDIA.count > 1`.
- No part of the schema or UI should assume a 1:1 work-to-media relationship.

---

## 12. Security Boundaries

- **Client never talks to Supabase with elevated privileges.** The anon key used client-side is restricted entirely by RLS.
- **Admin mutations** happen through Server Actions/Route Handlers using a server-side Supabase client, with the user's authenticated session forwarded so RLS still applies (avoid using a service-role key from request-handling code where the authenticated-user client is sufficient).
- **Cloudinary secret** stays server-side only, used solely to generate signed upload parameters.
- **Admin routes** are excluded from search engine indexing via `robots` metadata/`noindex`.

---

## 13. Environment Variables (Conceptual — see README.md for `.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        (server-only; used sparingly/never if avoidable)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET            (server-only)
NEXT_PUBLIC_SITE_URL
```

---

## 14. Error Handling

- Server Actions return structured `{ success, error }` results rather than throwing raw errors to the client.
- Public pages degrade gracefully: empty categories show an empty state (see `DESIGN.md`), failed media loads show a fallback state, not a broken layout.
- Admin forms surface validation errors inline, not as unhandled exceptions.

---

## 15. Caching & Performance

- Public gallery pages leverage Next.js caching/revalidation (e.g., revalidate on publish/unpublish via on-demand revalidation from the relevant Server Action) rather than long blind static caching that could show stale content.
- Images/videos are served through Cloudinary's CDN with responsive sizing and modern formats (e.g., automatic format/quality negotiation).
- Code splitting is achieved naturally via the App Router; heavy admin-only code (uploaders, rich forms) should not be bundled into the public site.

---

## 16. Deployment

- Target: Vercel or Cloudflare (final choice recorded in `FEATURE_LOG.md` at implementation time).
- Environment variables configured in the hosting platform's dashboard, never committed to the repository.
- A `.env.example` file documents required variables without values.

---

## 17. Non-Architectural Note

This document describes the **intended** architecture only. As of this writing, no repository, schema migration, or deployed environment exists yet. Any statement here must be validated against `PROJECT_REPORT.md` before being treated as fact about the current codebase.
