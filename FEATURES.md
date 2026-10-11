# FEATURES.md

> **Status legend:** `PLANNED` · `IN PROGRESS` · `IMPLEMENTED` · `TESTED` · `DEFERRED`
>
> As of this document's creation, the project has no code. **Every feature below is `PLANNED`** unless noted otherwise. This file must be updated as work progresses — see the maintenance process in `PROJECT_CONTEXT.md`.

---

## CORE FEATURES

### Public Gallery

| Feature | Status | Notes |
|---|---|---|
| Pinterest-style masonry/asymmetric gallery | IMPLEMENTED | CSS-columns layout against mock data; needs review against real media |
| Data-driven category filtering | IMPLEMENTED | URL-param based, sourced from mock `CATEGORY` list |
| Smooth, non-reloading filter transitions | IN PROGRESS | Currently a Next.js soft navigation; Motion-based transition not yet added |
| Responsive design (mobile-first) | IN PROGRESS | Gallery/viewer/admin built mobile-first; not yet device-tested |
| Lazy-loaded / responsive images | PLANNED | Depends on real Cloudinary URLs |
| Video previews with viewport-aware autoplay | IMPLEMENTED | `lib/activeVideoRegistry.ts` + `GalleryVideo.tsx`; untested with real video files |
| Single-video-at-a-time playback | IMPLEMENTED | Via shared playback registry |
| Play/duration indicators on video cards | IMPLEMENTED | |

### Work Viewer

| Feature | Status | Notes |
|---|---|---|
| Immersive work viewer (modal + shareable route) | IMPLEMENTED | Intercepted `@modal` route + standalone `/work/[slug]` page |
| Work metadata display (title, category, type, description, tools, date, tags) | IMPLEMENTED | Tags field not yet in mock schema/UI |
| Previous/next navigation between works | IMPLEMENTED | Ordered by `display_order` across all published works |
| Related work suggestions | IMPLEMENTED | By shared category only (tags not yet modeled) |
| Multi-media project support (many media per work) | IMPLEMENTED | `WORK` → many `MEDIA` in both mock data and UI |
| Simplified UI for single-media works | IMPLEMENTED | Thumbnail strip only renders when `media.length > 1` |
| Direct video playback with controls | PLANNED | Native `<video>` wired for autoplay preview only so far |
| High-quality, uncropped image display | IN PROGRESS | `object-cover` used for cards; viewer's main frame still needs a "contain" review per `DESIGN.md` §11 |

### Data & Backend

| Feature | Status | Notes |
|---|---|---|
| Supabase PostgreSQL schema (Category, Work, Media) | PLANNED | Designed in `ARCHITECTURE.md` §3.2; no live project yet |
| Row Level Security policies | PLANNED | Cannot exist until a Supabase project/schema exists |
| Cloudinary media storage & delivery | PLANNED | No live Cloudinary project yet |
| Signed, server-authorized uploads | IN PROGRESS | `lib/cloudinary/sign.ts` written; not yet called from any UI |

### Admin Panel

| Feature | Status | Notes |
|---|---|---|
| Admin authentication (Supabase Auth) | IN PROGRESS | Route-gating built; fails until real Supabase project connected |
| Admin dashboard / works list | IMPLEMENTED | `/admin/works`, against mock data |
| Add new work | IN PROGRESS | Form built (`/admin/works/new`); save not yet persisted |
| Edit existing work | IN PROGRESS | Form built (`/admin/works/[id]`); save not yet persisted |
| Delete work | PLANNED | Not yet built |
| Draft / publish workflow | IN PROGRESS | `status` field exists in form/schema; not yet persisted |
| Featured work flag | IN PROGRESS | Field exists in form/schema; not yet persisted |
| Manual display ordering | PLANNED | Field exists in schema; no reorder UI yet |
| Category management (create/rename/reorder/remove) | IN PROGRESS | List view built (`/admin/categories`); mutations not yet connected |
| Multi-media management per work | PLANNED | Noted as pending directly in the work form UI |
| Image upload | PLANNED | Depends on Cloudinary connection |
| Video upload | PLANNED | Depends on Cloudinary connection |
| Preview before publishing | PLANNED | Not yet built |
| Mobile-friendly admin experience | IN PROGRESS | Built mobile-first; not yet tested on a real device |

### SEO & Sharing

| Feature | Status | Notes |
|---|---|---|
| Per-work metadata / Open Graph tags | IMPLEMENTED | `generateMetadata` in `/work/[slug]/page.tsx` |
| Semantic HTML structure | IN PROGRESS | Core pages use semantic elements; not yet fully audited |
| Sitemap & robots configuration | IMPLEMENTED | `app/sitemap.ts`, `app/robots.ts` (admin disallowed) |
| Shareable, direct work URLs | IMPLEMENTED | `/work/[slug]` |

### Accessibility

| Feature | Status | Notes |
|---|---|---|
| Keyboard navigation (viewer prev/next, Escape-to-close) | IN PROGRESS | Escape-to-close via native `<dialog>`; prev/next are links, not yet arrow-key bound |
| Focus states & focus trapping in modals | IMPLEMENTED | Native `<dialog>` provides focus trapping; global focus-visible style in `globals.css` |
| Alt text for all meaningful images | IN PROGRESS | Field exists in schema/mock data; not yet authorable from the admin form |
| `prefers-reduced-motion` support | IMPLEMENTED | Handled globally in `globals.css` |
| Sufficient color contrast | IN PROGRESS | Palette chosen with contrast in mind; not yet formally audited |

---

## FUTURE FEATURES

These are acknowledged possible additions, **not** part of current scope. They must not be implemented without first updating `PROJECT_CONTEXT.md` to move them into current scope.

| Feature | Status | Notes |
|---|---|---|
| Development / coding projects section | DEFERRED | Would be a separate section/future version |
| Additional media types (audio, 3D/interactive embeds) | DEFERRED | Architecture allows this without major restructuring |
| Multi-admin / role-based access | DEFERRED | Current scope is single-admin |
| Public comments / likes / social features | DEFERRED | Requires explicit re-approval |
| Admin analytics dashboard | DEFERRED | |
| Internationalization | DEFERRED | |
| Dark/light theme toggle | DEFERRED | Noted as a nice-to-have in `DESIGN.md`, not required for launch |

---

## NON-GOALS

These are intentionally out of scope and should not be built unless this document and `PROJECT_CONTEXT.md` are explicitly revised:

- Developer/software-engineering portfolio content in the current version.
- Blog or content-marketing functionality.
- Multi-tenant support (this is a single-owner site).
- E-commerce, payments, or monetization.
- Public visitor accounts or sign-up.
- Comment systems.
- A general-purpose/heavy CMS abstraction beyond what this single site needs.
- Any paid service beyond Supabase and Cloudinary without explicit approval.
