# CODING_RULES.md

> **Status:** Binding rules for all future implementation work on this project. Any AI coding agent or contributor must follow these rules. Deviating requires an explicit, recorded decision in `FEATURE_LOG.md`.

---

## 1. General Principles

- Correctness, clarity, and security take priority over cleverness or brevity.
- Do not change architecture, schema, or core stack choices casually — any such change is a decision that must be recorded in `FEATURE_LOG.md` and reflected in `PROJECT_CONTEXT.md` / `ARCHITECTURE.md`.
- Do not introduce abstractions (generic frameworks, plugin systems, config layers) without a real, current need. Build for the current scope in `PROJECT_CONTEXT.md`, not speculative future scope.
- Do not install unnecessary dependencies. Every new dependency must be justifiable against a documented feature.

---

## 2. TypeScript

- Strict mode enabled project-wide.
- Avoid `any` unless there is truly no reasonable alternative (e.g., a poorly-typed third-party callback) — and if used, isolate and comment it.
- Prefer explicit, narrow types over broad or loosely-typed structures.
- Shared domain types (Work, Media, Category, Tag) are defined once in a central types location and imported everywhere — never redefined per-component.
- Use discriminated unions for variant data (e.g., `MediaType: 'image' | 'video'`) instead of optional/boolean flags that imply state.

---

## 3. React & Components

- Functional components only.
- One component per file; file name matches the component name.
- Keep components focused: a component that fetches data, manages complex state, *and* renders a large UI tree should be split into a data-fetching layer + presentational component(s).
- Presentational/UI components must not contain business logic or direct data-access calls (see §8).
- Co-locate component-specific types and small helper functions with the component; move shared logic to a shared utilities module.

---

## 4. Next.js / App Router

- Default every component to a **Server Component**. Add `"use client"` only when the component genuinely needs:
  - browser-only APIs (IntersectionObserver, video playback control, drag-and-drop upload, etc.),
  - interactive local state (filters, viewer navigation, forms), or
  - event handlers that can't be satisfied by a Server Action alone.
- Data fetching for pages/lists happens in Server Components or dedicated server-side data-access functions — never inside a Client Component via ad hoc `fetch`/Supabase calls unless there's a specific, justified interactive reason (e.g., paginated client-driven loading).
- Mutations (create/update/delete/publish) go through **Server Actions** (or Route Handlers where a Server Action isn't suitable, e.g., signed upload endpoints).
- Route segments under `/admin` must share a layout that performs the authentication check server-side; no admin page may assume the layout's check without also being safe if accessed directly.

---

## 5. File & Folder Naming

- Components: `PascalCase.tsx` (e.g., `MasonryGrid.tsx`).
- Non-component modules (utilities, data access, types): `camelCase.ts` (e.g., `getPublishedWorks.ts`).
- Route files follow Next.js App Router conventions (`page.tsx`, `layout.tsx`, `route.ts`).
- Folder names: lowercase, kebab-case if multi-word (e.g., `work-viewer/`).

---

## 6. Naming Conventions (Variables, Functions, Types)

- Variables and functions: descriptive `camelCase` — avoid abbreviations that aren't immediately obvious (`cat` for category is not acceptable; `category` is).
- Boolean variables/props: prefixed for clarity (`isPublished`, `hasMedia`, `shouldAutoplay`).
- Types/interfaces: `PascalCase`, named after the domain concept they represent (`Work`, `Media`, `Category`), not generic names like `Data` or `Item`.
- Server Actions: named as verbs describing the mutation (`createWork`, `updateWorkStatus`, `deleteMediaItem`).

---

## 7. Functions

- Keep functions small and single-purpose; a function name should fully describe what it does.
- Avoid deeply nested conditionals — prefer early returns.
- Pure/util functions (formatting, computing display data) should not perform data fetching or side effects.

---

## 8. Data Fetching, Server Actions & Business Logic

- **Never place database queries or Cloudinary API calls directly inside presentation components.**
- All Supabase queries live in a dedicated data-access layer (e.g., `lib/data/works.ts`, `lib/data/categories.ts`), called from Server Components or Server Actions — not scattered inline across the codebase.
- Business logic (e.g., "what counts as a publishable work," "how related work is computed") lives in this data-access/service layer, not duplicated across multiple components or routes.
- Server Actions validate input before touching the database (see §11) and return a consistent, typed result shape (e.g., `{ success: boolean; error?: string; data?: T }`) rather than throwing uncaught exceptions to the client.

---

## 9. Supabase Usage Rules

- Use the appropriate Supabase client for the context: server-side client (with the user's session) for authenticated operations, and the public anon client only for public read paths.
- **Never bypass Row Level Security.** Do not use a service-role key from user-facing request handling unless there is a specific, documented, narrow reason (e.g., a trusted background/admin-only maintenance task) — and if so, that decision is recorded in `FEATURE_LOG.md`.
- All tables must have RLS enabled; no table is ever left without policies "temporarily."
- Schema changes are made via migrations, not ad hoc manual edits, so the schema history stays reproducible.

---

## 10. Cloudinary Usage Rules

- The Cloudinary API secret is used **only** in server-side code (Server Actions/Route Handlers) to generate signed upload parameters — never bundled into client code or exposed via `NEXT_PUBLIC_*` variables.
- Client-side upload code only ever receives a signature/timestamp/API key needed to perform a signed upload directly to Cloudinary; it never receives the API secret.
- Store only what's needed to manage and display media in Supabase (`url`, `thumbnail_url`, `public_id`, `type`, dimensions/duration if available) — do not duplicate Cloudinary's own metadata unnecessarily.

---

## 11. Environment Variables

- All secrets and environment-specific values are read from environment variables — never hardcoded.
- Client-exposed variables are explicitly prefixed `NEXT_PUBLIC_` and must never include secrets (API secrets, service-role keys).
- A `.env.example` file is kept up to date with every variable name (no real values) whenever a new one is introduced.

---

## 12. Validation

- All Server Action / Route Handler inputs are validated before use (e.g., via a schema validation library such as Zod) — never trust client-submitted data as pre-validated, even from the Admin Panel.
- File uploads are validated for type and reasonable size limits before initiating the signed upload flow.
- Slugs (for works/categories) are validated/generated server-side to ensure uniqueness and URL-safety.

---

## 13. Security

- Never expose secrets (Supabase service-role key, Cloudinary API secret) to the client, in logs visible to users, or in committed code.
- Never bypass authentication checks for admin routes/actions, even temporarily "for testing" — use a separate local/dev flow instead if needed, and remove it before considering the work done.
- Never bypass RLS policies from application code paths reachable by end users.
- Treat all admin-panel inputs as untrusted input from a security standpoint, even though there's a single trusted admin — this keeps the codebase correct if roles expand later.

---

## 14. Accessibility

- Use semantic HTML elements (`button`, `nav`, `main`, `article`, `dialog`) — do not simulate interactive elements with styled `div`/`span` plus a click handler.
- All images require meaningful `alt` text sourced from the work's authored metadata; purely decorative images use empty `alt=""`.
- Modals/dialogs (work viewer, admin confirmation dialogs) must support Escape-to-close and trap focus appropriately.
- Respect `prefers-reduced-motion` in any animation implementation.

---

## 15. Tailwind CSS

- Use Tailwind's design tokens (spacing, color, radius scale) configured in the theme — avoid arbitrary one-off values (e.g., `mt-[13px]`) except where truly necessary, and prefer extending the theme instead.
- Avoid duplicating long class strings across many components — extract a shared component or a small class-name utility instead.
- Keep class lists readable; group related utilities (layout, spacing, color, typography) in a consistent order where practical.

---

## 16. Motion (Animation Library)

- Keep animation definitions co-located with the component they animate; avoid a large, disconnected global animation config unless a clear reuse need emerges.
- Animation durations and easing should be consistent across similar interactions (e.g., all filter transitions use the same timing).
- No animation should block or delay the user's ability to see or interact with content — animate *in addition to* fast rendering, not instead of it.

---

## 17. Imports

- Use absolute/aliased imports (e.g., `@/components/...`, `@/lib/...`) rather than long relative paths (`../../../..`).
- Avoid wildcard imports (`import * as X`) except where a library specifically requires that pattern.
- Keep import order consistent (external packages, then internal aliases, then relative imports).

---

## 18. Comments

- Comment *why*, not *what* — the code should already show what it does.
- Document non-obvious decisions (e.g., "why this query is structured this way for RLS," "why this component is a Client Component") directly above the relevant code.
- Do not leave commented-out code in committed files; remove it (version control preserves history).

---

## 19. Dead Code

- Remove unused components, functions, types, and variables rather than leaving them "just in case."
- Remove feature-flagged or experimental code paths once a decision is made, rather than accumulating unused branches.

---

## 20. Reusability

- Extract a shared component/util only once a real duplication exists (avoid premature abstraction) — but do extract promptly once it does, rather than copy-pasting a third time.
- Shared UI primitives (buttons, inputs, dialogs) live in a common `components/ui` location and are reused across both the public site and Admin Panel where visually appropriate.

---

## 21. Dependency Management

- Before adding a dependency, confirm the same result can't reasonably be achieved with the existing stack (React, Next.js, Tailwind, shadcn/ui, Motion, Supabase client, Cloudinary SDK).
- Pin dependency versions deliberately; avoid unpinned `latest` ranges that can silently change behavior.
- Remove dependencies that become unused as the project evolves.

---

## 22. When Documentation and Code Conflict

Per `PROJECT_CONTEXT.md`'s maintenance process: if implementation and documentation disagree, determine whether the code is a mistake (fix the code) or an intentional change (update the documentation and record the decision in `FEATURE_LOG.md`). Code should never silently drift from these documents.
