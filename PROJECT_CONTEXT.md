# PROJECT_CONTEXT.md

> **Purpose of this document:** This is the permanent memory of the project. Any AI coding agent or human contributor must read this file first, before writing or modifying any code. It defines what this project *is*, what it is *not*, and the decisions that must not be silently reversed.
>
> **Last updated:** 2026-09-07 (documentation stage — no code written yet)

---

## 1. Project Identity

- **Name:** Tarun / Visual Works
- **Type:** Personal creative showcase / visual works archive
- **Owner:** Tarun (single-user project; one admin)
- **Stage:** Pre-implementation. Documentation and architecture planning only.

---

## 2. Purpose

Create a highly visual, modern, minimal, and interactive website whose sole job is to showcase creative visual work — design, posters, photo edits, AI-generated images and video, and short-form video edits.

The guiding product statement is:

> "Make it extremely easy for a visitor, recruiter, client, or potential employer to browse and understand my work quickly."

The work itself is the content. The site is not a resume, not a list of skills, and not a text-heavy personal statement.

---

## 3. Product Philosophy

- The website is a **digital visual archive** / **curated digital exhibition**, not a template-driven portfolio.
- Visitors should see actual creative work within seconds of landing on the site.
- Browsing should feel like scrolling a curated Pinterest-style wall, not reading a brochure.
- Every piece of UI must justify its presence; nothing should compete visually with the artwork.
- The system must be **future-proof**: new work must be addable without code changes, via an Admin Panel.

---

## 4. Target Users

1. **Casual visitors** — want to quickly browse visually interesting work.
2. **Recruiters / potential employers** — need to assess creative skill fast, without reading long bios.
3. **Clients** — want to evaluate style and quality of work for hire.
4. **The owner (admin)** — needs to add, edit, organize, and publish/unpublish work, including from a mobile phone.

---

## 5. Current Scope (CURRENT)

The current, approved scope for the first build is:

- A public-facing gallery site showcasing creative visual work only (no coding/dev projects).
- Pinterest-style masonry/asymmetric gallery as the homepage.
- Data-driven category filtering.
- An immersive work viewer for individual pieces, supporting images and video.
- Support for multi-media projects (one project containing several media items).
- Mobile-first, fully responsive experience.
- An Admin Panel for managing works, media, and categories, usable from a phone.
- Supabase (Postgres + Auth + RLS) as the backend.
- Cloudinary as the media storage/CDN layer.
- Deployment on Vercel or Cloudflare.

**Nothing in this list is implemented yet.** This document describes intended scope, not delivered functionality. See `PROJECT_REPORT.md` for actual implementation status at any point in time.

---

## 6. Future Scope (FUTURE — NOT CURRENT)

The following are acknowledged possible future directions. They are **not** part of the current build and must not be designed around in a way that adds present-day complexity:

- A separate "Development / Code Projects" section, added later as an additional category or a distinct area of the site, once the creative showcase is stable.
- Additional media types beyond image/video (e.g., audio, 3D/interactive embeds).
- Multi-admin / multi-user support (currently single-admin only).
- Public comments, likes, or social interaction features (not currently planned; would require explicit re-approval, see Non-Goals).
- Analytics dashboards inside the Admin Panel.
- Internationalization / multi-language support.

Any AI agent must not implement future-scope items unless this document is explicitly updated to move them into Current Scope.

---

## 7. Explicit Non-Goals

- This is **not** a developer/software-engineering portfolio in its current version.
- This is **not** a blog or content-marketing site.
- This is **not** a multi-tenant SaaS product — it serves one owner/admin.
- No e-commerce, payments, or monetization in current scope.
- No public user accounts or visitor sign-up.
- No comment systems or social features unless explicitly approved later.
- No heavy CMS abstraction beyond what is needed for this single site.
- No premature introduction of paid services when a free/low-cost option meets the need.

---

## 8. Approved Technology Stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js (App Router) |
| UI library | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component library | shadcn/ui (used selectively, especially in the Admin Panel) |
| Animation | Motion (Framer Motion successor library) |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Data access security | Supabase Row Level Security (RLS) |
| Media storage/CDN | Cloudinary |
| Version control | GitHub |
| Deployment | Vercel or Cloudflare |

This stack is **approved and should not be changed casually**. Any change to a core technology choice is an architecture decision and must be recorded in `FEATURE_LOG.md` and reflected in `ARCHITECTURE.md`.

---

## 9. Dependency Philosophy

- Prefer the smallest dependency set that satisfies the requirement.
- Do not add a library for something Tailwind, React, or Next.js already solves natively.
- Every new dependency should be justifiable in one sentence tied back to a documented feature.
- Avoid paid third-party services beyond Supabase and Cloudinary unless there is a clear, approved need — the project should remain free or low-cost through development and early usage.

---

## 10. UX Decisions (Approved)

- Homepage = the gallery. No large hero/marketing section blocking access to the work.
- Masonry/asymmetric layout that respects each item's native aspect ratio; the system must not force-crop artwork into uniform tiles.
- Category filtering is client-perceived as instant (no full page reload), even though data may be server-fetched.
- Clicking a work opens an **immersive viewer** — implemented in a way that preserves a shareable, direct URL per work (see `ARCHITECTURE.md` for the routing approach).
- Multi-media projects are a first-class concept: a project can contain 1..N media items; the UI stays simple when a project has exactly one media item.
- Videos autoplay muted only when in viewport, pause when out of viewport, and the system never plays many videos at once.

---

## 11. Media Strategy

- All actual image/video assets are stored and delivered through **Cloudinary** (storage, transformations, thumbnails, optimization, CDN).
- **Supabase stores only metadata and references** (Cloudinary public IDs/URLs, captions, ordering, etc.) — never the binary media itself.
- Cloudinary credentials/secrets used for signed uploads must never be exposed to client-side code; uploads from the Admin Panel go through a server-side signing step.

---

## 12. Authentication Strategy

- Supabase Auth is used for Admin authentication only. There is no public user authentication in current scope.
- A single admin role is sufficient for current scope; the `ADMIN_USER` concept allows for future roles without redesign.
- All admin routes (`/admin/**`) require an authenticated session; there is no client-side-only gate — authorization is enforced server-side and via RLS.

---

## 13. Database Strategy

- Supabase PostgreSQL is the system of record for all structured data: categories, works/projects, media metadata, tags.
- Row Level Security (RLS) enforces that:
  - Public/anonymous access can only read **published** works and their media.
  - Only authenticated admin(s) can create, update, or delete any record, and can read drafts.
- Schema favors simplicity over premature normalization; see `ARCHITECTURE.md` for the concrete schema and relationships.

---

## 14. Deployment Strategy

- Deployment target: **Vercel or Cloudflare** (final choice may depend on Next.js feature support and cost at implementation time; this decision should be recorded in `FEATURE_LOG.md` once made).
- Environment variables hold all secrets (Supabase keys, Cloudinary credentials); none are committed to source control. `.env.example` documents required variables without real values.
- Admin routes must be excluded from search engine indexing (`robots`/`noindex`).

---

## 15. Constraints

- Must work extremely well on mobile — both the public gallery and the Admin Panel, since the owner may upload work directly from a phone.
- Must remain performant with hundreds of works and media items.
- Must avoid unnecessary client-side JavaScript; prefer Server Components except where interactivity (filtering, viewer navigation, video playback, admin forms) requires a Client Component.
- Must avoid introducing paid services beyond Supabase and Cloudinary without explicit approval.
- Must keep the design restrained: no excessive gradients, glassmorphism, shadows, or generic SaaS visual patterns.

---

## 16. Important Decisions Log (Summary)

See `FEATURE_LOG.md` for the full chronological log. Key foundational decisions already approved:

1. Creative-work-first scope; no developer portfolio content in the current version.
2. Digital-archive / exhibition experience over traditional portfolio layout.
3. Pinterest-style masonry gallery as the homepage.
4. Data-driven categories (not hardcoded in UI).
5. Immersive click-to-view work viewer with shareable URLs.
6. Viewport-aware, single-video-at-a-time autoplay behavior.
7. Multi-media project model (`PROJECT` → many `MEDIA`).
8. Mobile-friendly Admin Panel, including uploads from phone.
9. Supabase for backend/data/auth; Cloudinary for media.
10. Future-proof, data-driven architecture so new work never requires a code change.

---

## 17. How This Document Should Be Used

- Any AI coding agent must read this file before making product or architecture decisions.
- If a request conflicts with this document, the agent should flag the conflict rather than silently deviating.
- Updates to scope, philosophy, or approved stack must be reflected here **and** logged in `FEATURE_LOG.md`.
