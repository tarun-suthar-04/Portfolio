# FEATURES.md

> **Status legend:** `PLANNED` · `IN PROGRESS` · `IMPLEMENTED` · `TESTED` · `DEFERRED`
>
> Status reflects the repository implementation as of 2026-10-12.

---

## CORE FEATURES

### Public Gallery

| Feature | Status | Notes |
|---|---|---|
| Pinterest-style masonry/asymmetric gallery | IMPLEMENTED | CSS-columns layout; connected to live Supabase data |
| Data-driven category filtering | IMPLEMENTED | URL-param based, categories from Supabase |
| Smooth, non-reloading filter transitions | IN PROGRESS | Next.js soft navigation; no skeleton/loading state yet |
| Responsive design (mobile-first) | IN PROGRESS | Built mobile-first; not yet device-tested |
| Lazy-loaded / responsive images | PLANNED | MediaFrame uses raw img — next/image migration needed |
| Video previews with viewport-aware autoplay | IMPLEMENTED | activeVideoRegistry + GalleryVideo; untested with real files |
| Single-video-at-a-time playback | IMPLEMENTED | Via shared playback registry |
| Play/duration indicators on video cards | IMPLEMENTED | |
| Gallery loading skeleton (loading.tsx) | PLANNED | |
| Lazy video src loading (no network requests until visible) | PLANNED | |

### Work Viewer

| Feature | Status | Notes |
|---|---|---|
| Immersive work viewer (modal + shareable route) | IMPLEMENTED | Intercepted @modal route + standalone /work/[slug] page |
| Work metadata display (title, category, description, tools, date) | IMPLEMENTED | |
| Previous/next navigation between works | IMPLEMENTED | Ordered by display_order |
| Related work suggestions | IMPLEMENTED | By shared category |
| Multi-media project support (many media per work) | IMPLEMENTED | |
| Simplified UI for single-media works | IMPLEMENTED | Thumbnail strip only when media.length > 1 |
| Direct video playback with controls | PLANNED | Native video wired for autoplay preview only |
| Keyboard arrow-key navigation (prev/next) | PLANNED | Client Component shell exists; listener not implemented |

### Data & Backend

| Feature | Status | Notes |
|---|---|---|
| Supabase PostgreSQL schema (Category, Work, Media) | IMPLEMENTED | Migration 0001 applied to live DB |
| Row Level Security policies (admin-only writes) | IMPLEMENTED | Migration 0002 applied to live DB on 2026-10-12 |
| Cloudinary media storage & delivery | IN PROGRESS | Signed upload wired; live credentials need verification |
| Signed, server-authorized uploads | IN PROGRESS | Server signs per-work folder; browser uploads directly |
| Supabase-backed sitemap | PLANNED | sitemap.ts still uses mock data |

### Admin Panel

| Feature | Status | Notes |
|---|---|---|
| Admin authentication (Supabase Auth) | IMPLEMENTED | Login + one-time first-admin registration |
| Admin dashboard / works list | IMPLEMENTED | /admin/works, live Supabase data |
| Add new work | IMPLEMENTED | Metadata persists; redirects to edit for media upload |
| Edit existing work | IMPLEMENTED | Metadata persists through admin Server Actions |
| Delete work | IMPLEMENTED | Work row and related media cascade-deleted |
| Draft / publish workflow | IMPLEMENTED | Publish blocked until at least one media item exists |
| Featured work flag | IMPLEMENTED | Saved with work metadata |
| Quick publish/unpublish toggle in works list | PLANNED | Currently requires opening edit form |
| Admin works search / filter | PLANNED | |
| Manual display ordering (drag or arrows) | PLANNED | Field exists in schema/form; no reorder UI |
| Category management (create/delete) | IMPLEMENTED | Create and delete with inline error messages |
| Category rename | PLANNED | |
| Category reorder | PLANNED | |
| Category description | PLANNED | Field exists in DB; no admin UI or public display yet |
| Multi-media management per work (upload) | IMPLEMENTED | Signed upload, size/type checks, Supabase persistence |
| Media delete | PLANNED | |
| Media reorder | PLANNED | |
| Alt-text editing for media | PLANNED | Field exists in DB; not editable via admin form yet |
| Confirm-before-delete for works | PLANNED | Currently submits immediately |
| Preview before publishing | PLANNED | |
| Mobile-friendly admin experience | IN PROGRESS | Built mobile-first; not yet tested on device |

### SEO & Sharing

| Feature | Status | Notes |
|---|---|---|
| Per-work metadata / Open Graph tags | IMPLEMENTED | generateMetadata in /work/[slug]/page.tsx |
| Semantic HTML structure | IN PROGRESS | Not yet fully audited |
| Sitemap (live Supabase data) | PLANNED | sitemap.ts still uses mockWorks |
| robots.txt (admin disallowed) | IMPLEMENTED | |
| Shareable direct work URLs | IMPLEMENTED | /work/[slug] |

### Accessibility

| Feature | Status | Notes |
|---|---|---|
| Keyboard navigation (Escape-to-close modal) | IMPLEMENTED | Native dialog provides this |
| Keyboard navigation (viewer prev/next arrow keys) | PLANNED | Client Component shell is ready |
| Focus states & focus trapping in modals | IMPLEMENTED | Native dialog + global focus-visible in globals.css |
| Alt text for all meaningful images | IN PROGRESS | Field in schema; not authorable via admin yet |
| prefers-reduced-motion support | IMPLEMENTED | Handled globally in globals.css |
| Sufficient color contrast | IN PROGRESS | Not yet formally audited |

---

## FUTURE FEATURES

These are acknowledged possible additions, not part of current scope.

| Feature | Status | Notes |
|---|---|---|
| Development / coding projects section | DEFERRED | Separate future version |
| Additional media types (audio, 3D/interactive) | DEFERRED | Architecture allows this |
| Multi-admin / role-based access | DEFERRED | Single-admin scope currently |
| Public comments / likes / social features | DEFERRED | |
| Admin analytics dashboard | DEFERRED | |
| Internationalization | DEFERRED | |
| Dark/light theme toggle | DEFERRED | Noted nice-to-have in DESIGN.md |
| OG image generation via next/og | DEFERRED | Nice-to-have for social sharing |
| Password-protected private works | DEFERRED | |
| Analytics (Plausible or Vercel) | DEFERRED | |

---

## NON-GOALS

- Developer/software-engineering portfolio content in the current version.
- Blog or content-marketing functionality.
- Multi-tenant support.
- E-commerce, payments, or monetization.
- Public visitor accounts or sign-up.
- Comment systems.
- A general-purpose CMS abstraction beyond this single site.
- Any paid service beyond Supabase and Cloudinary without explicit approval.
