# DESIGN.md

> **Status:** Planned design system. Nothing described here has been implemented yet.

---

## 1. Design Philosophy

The site is a **curated digital exhibition**, not a generic portfolio template. Every design decision should answer: *"Does this help the visitor see and understand the work faster, or does it get in the way?"*

Principles:
- Minimal, modern, editorial.
- Visual-first — the artwork is always the hierarchy's top priority.
- Premium and quiet, not loud or trendy.
- Strong typographic hierarchy instead of decorative UI.
- Generous whitespace to let individual works breathe.
- Motion is subtle and purposeful, never decorative for its own sake.

**Explicitly avoid:**
- Excessive gradients
- Excessive glassmorphism
- Excessive drop shadows
- Generic SaaS-template aesthetics (rounded gradient blobs, stock illustration, oversized marketing hero sections)
- Walls of text before the work is visible
- Animation that delays access to content
- Complicated, multi-level navigation
- Any decorative element that visually competes with the artwork

---

## 2. Color System

- **Base palette:** Neutral, restrained (near-black / near-white / a small set of grays), so that the artwork itself provides the color energy on the page.
- **Accent color:** A single, deliberate accent (exact value TBD during visual design pass) used sparingly — for focus states, active filters, links, and key calls to action. Not used decoratively.
- **Dark/light mode:** Recommended as a future enhancement rather than a day-one requirement; if implemented, both modes must preserve neutral, non-competing backgrounds so media colors remain accurate.
- Categories/tags should use **typographic or outline treatment** (e.g., text labels, thin borders) rather than assigning a distinct bright color per category, to avoid visual noise across a large, varied gallery.

---

## 3. Typography

- A strong, confident **display typeface** for titles (work titles, section headers) paired with a highly legible **body/UI typeface** for descriptions, metadata, and interface text.
- Limit to two font families maximum.
- Establish a clear scale, roughly:
  - Display / hero title (rare use, e.g., a work's title in the viewer)
  - Section heading (e.g., category labels, viewer metadata headers)
  - Body text (descriptions)
  - Small/meta text (dates, tags, tools used)
- Line length for descriptions should stay comfortably readable (avoid full-width paragraphs on large screens).
- Avoid decorative or novelty fonts; typography should feel editorial and confident, similar to a design/photography magazine rather than a tech product.

---

## 4. Spacing & Layout

- Generous, consistent spacing scale (e.g., a standard Tailwind-based spacing scale used consistently rather than ad hoc pixel values).
- Masonry gallery gutters should be tight enough to feel curated/dense (Pinterest-like) but never so tight that individual pieces lose visual separation.
- Page margins scale responsively — narrower on mobile, wider on large desktop, so the gallery never feels cramped or excessively wide-lined.

---

## 5. Radius & Shape

- Rounded corners used **where appropriate** — primarily on interactive surfaces (cards, buttons, inputs, modals) — with a consistent, moderate radius across the system.
- Media itself (images/video) should generally respect a light, consistent corner radius on gallery cards, but the **work viewer's main media display should prioritize the artwork's natural presentation** and may use minimal or no radius to avoid visually clipping the work.

---

## 6. Shadows

- Used sparingly and only to establish clear elevation where it aids usability (e.g., a modal/viewer over the gallery, a dropdown menu).
- No decorative drop shadows on gallery cards purely for a "glossy" look — separation between cards is achieved through spacing and subtle background contrast, not heavy shadow.

---

## 7. Gallery / Masonry Cards

- Cards preserve each media item's **native aspect ratio** — no forced square-cropping that damages composition.
- Each card shows, at minimum:
  - The media (image, or video preview per the video card rules below)
  - A category label (subtle, e.g., small caps or muted text, positioned to not obstruct the artwork)
  - On hover (desktop) / on view (mobile): may reveal the title as a light overlay or below the media, without obscuring the artwork itself by default.
- Loading: cards should occupy their approximate final size before media fully loads (using known/estimated aspect ratio) to avoid layout shift; use a subtle placeholder (blurred low-res preview or neutral skeleton block).

---

## 8. Video Cards

- Video cards behave like image cards visually until playback begins.
- Show a poster/thumbnail image by default.
- A small, unobtrusive **play indicator** icon signals that the item is a video.
- A **duration indicator** (e.g., "0:32") appears in a corner where useful.
- When scrolled into the viewport, the video autoplays muted; leaving the viewport pauses it (see `ARCHITECTURE.md` §9).
- No visible player controls in the gallery card itself — controls appear in the full work viewer.

---

## 9. Category Filter (Navigation)

- Positioned prominently but compactly near the top of the gallery — a simple horizontal row of category labels/pills (scrollable on mobile if the category list is long).
- The active category is indicated with the single accent color or an underline/pill treatment — not multiple colors per category.
- Selecting a category smoothly transitions the visible set of works (fade/reflow via Motion) rather than a jarring reload or empty flash.
- "All" is always the default/first option.

---

## 10. Work Viewer

- Large, dominant media area — the primary visual focus of the screen.
- Metadata (title, category, description, tools used, date, tags) appears clearly **below or beside** the media, never overlapping it in a way that obscures the work.
- Previous/next navigation is easily discoverable (arrows and/or swipe gesture on mobile, arrow keys on desktop) without cluttering the visual frame.
- Related work appears below the main content, using the same card treatment as the main gallery for visual consistency.
- Opens with a smooth, quick transition (Motion) from the originating gallery card when navigated from the gallery; a direct link load renders the full page cleanly without requiring that transition.
- **Escape-to-close** returns to the gallery (when opened as a modal/intercepted route) at the scroll position the visitor left.

---

## 11. Image Display Rules

- High-quality, correctly-sized images (responsive `srcset`/Cloudinary transformations) matched to the display context.
- No unnecessary cropping — the viewer shows the image at its correct aspect ratio, fit within the available space (contain, not cover, in the main viewer).

---

## 12. Admin Interface

- Uses shadcn/ui components for consistency and speed: forms, dialogs, tables, dropdowns, toasts for feedback.
- Visually distinct from the public site — functional and clear rather than "exhibition-like" — but still consistent with the overall typographic and color system so it doesn't feel like a bolted-on separate product.
- Prioritizes clarity and mobile usability over visual flourish: large touch targets, clear field labels, obvious primary actions (Save, Publish, Delete with confirmation).
- Media upload interface shows clear progress feedback and thumbnail previews as soon as available.

---

## 13. Buttons

- A small, consistent set of button styles: **primary** (solid, accent color, for main actions like Publish/Save), **secondary** (outline/ghost, for lesser actions like Cancel), and **destructive** (clearly distinguished, e.g., for Delete, with confirmation required).
- Consistent sizing and radius across the whole system; no one-off button styles per page.

---

## 14. Forms (Admin)

- Clear field labels above inputs (not placeholder-only labels, for accessibility and clarity).
- Inline validation messaging near the relevant field, not only in a toast.
- Logical grouping: core metadata (title, description, category) separated visually from media management (upload/reorder) and publishing controls (status, featured, ordering).

---

## 15. Loading States

- Gallery: skeleton placeholders sized to the expected aspect ratio, not generic centered spinners, to avoid layout shift.
- Work viewer: media area shows a neutral placeholder until the asset is ready; metadata can render immediately since it loads faster than large media.
- Admin: standard inline spinners/disabled-button states during save/upload operations, plus upload progress where feasible.

---

## 16. Empty States

- Empty category filter result: a simple, quiet message (e.g., "No work in this category yet") — never a broken-looking blank grid.
- Empty Admin work list (no works yet): a clear prompt/button to add the first work.
- Empty categories list: a clear prompt to create the first category.

---

## 17. Error States

- Public site: a failed media load shows a minimal fallback (icon/label), not a broken image icon or empty space that could be mistaken for a bug.
- Admin: failed save/upload actions show a clear, specific inline error message near the action, with an obvious way to retry.
- No raw technical error messages or stack traces are ever shown to any user, admin included, in the UI (log details server-side instead).

---

## 18. Responsive Behavior

- Mobile-first: the mobile masonry layout, mobile viewer interactions (swipe/tap), and mobile admin forms are designed first, then enhanced for larger screens — not the reverse.
- Masonry column count adapts by breakpoint (e.g., fewer, wider columns on mobile; more, narrower columns on large desktop).
- Touch targets meet accessible minimum sizes throughout, especially in the Admin Panel.
- Typography scales down gracefully on small screens without becoming illegible or requiring horizontal scrolling.

---

## 19. Animation Principles

- Motion is used to **clarify transitions** (opening the viewer, filtering categories, admin panel feedback) — never as unprompted decoration.
- Keep durations short and easing natural; nothing should feel like it's making the visitor wait to see content.
- Respect the `prefers-reduced-motion` setting: reduce or remove non-essential motion (e.g., large transform/zoom transitions) when it is set, while preserving basic state changes (e.g., instant fades instead of slides).

---

## 20. Accessibility (Design-Level)

- Maintain sufficient color contrast between text and backgrounds in both the public site and Admin Panel.
- All interactive elements (filters, viewer navigation, admin controls) must have visible focus states.
- The work viewer, when modal, must trap focus appropriately and support Escape-to-close and keyboard navigation (prev/next via arrow keys).
- All meaningful images have alt text (authored per work in the Admin Panel); decorative elements are marked appropriately so assistive technology doesn't announce them unnecessarily.
- Category filters and admin controls use real interactive elements (`button`, `a`) with correct semantics — never non-semantic `div`s with click handlers standing in for controls.

---

## 21. Design System Coherence

All visual decisions (color, type, spacing, radius, shadow, motion) should be defined as a small, consistent set of tokens/utilities (Tailwind theme configuration) rather than one-off values scattered through components, so the system stays coherent as the catalog of work grows.
