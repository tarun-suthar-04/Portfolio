// TEMPORARY mock data layer.
//
// Per ARCHITECTURE.md §6 and CODING_RULES.md §8, real data access must live
// in a dedicated data-access layer (e.g. lib/data/works.ts) backed by
// Supabase, never inline in components. This file fills that same shape
// with in-memory sample data so the gallery/viewer UI can be built and
// reviewed before Supabase is connected.
//
// When Supabase is wired up: replace the bodies of these functions with
// real queries and keep the exported function signatures the same, so no
// component needs to change. Delete this file once lib/data/works.ts and
// lib/data/categories.ts exist for real.

import type { Category, Work } from "@/types/work";

export const CATEGORIES: Category[] = [
  { id: "cat-design", name: "Design", slug: "design", displayOrder: 1 },
  { id: "cat-poster", name: "Poster", slug: "poster", displayOrder: 2 },
  { id: "cat-photo-edit", name: "Photo Edit", slug: "photo-edit", displayOrder: 3 },
  { id: "cat-ai-image", name: "AI Image", slug: "ai-image", displayOrder: 4 },
  { id: "cat-ai-portrait", name: "AI Portrait", slug: "ai-portrait", displayOrder: 5 },
  { id: "cat-video", name: "Video", slug: "video", displayOrder: 6 },
  { id: "cat-ai-video", name: "AI Video", slug: "ai-video", displayOrder: 7 },
  { id: "cat-experiments", name: "Experiments", slug: "experiments", displayOrder: 8 },
];

function categoryBySlug(slug: string): Category {
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) throw new Error(`Unknown mock category slug: ${slug}`);
  return category;
}

// Deterministic sample aspect ratios so the masonry grid has realistic,
// varied proportions without loading any real media.
const ASPECTS = [0.75, 1, 1.33, 0.66, 1.5, 0.8, 1.1, 0.9, 1.25, 0.7];

function media(
  workId: string,
  index: number,
  type: "image" | "video",
  aspectRatio: number,
  extra?: Partial<{ duration: number; caption: string }>
) {
  return {
    id: `${workId}-media-${index}`,
    workId,
    type,
    url: "", // real Cloudinary URL once connected
    publicId: `${workId}-media-${index}`,
    altText: `${workId} sample media ${index}`,
    displayOrder: index,
    aspectRatio,
    ...extra,
  };
}

export const WORKS: Work[] = [
  {
    id: "w1",
    title: "Wander More",
    slug: "wander-more",
    description:
      "A short travel edit built around natural light and long lenses, paired with a set of behind-the-scenes stills from the shoot.",
    categoryId: "cat-video",
    category: categoryBySlug("video"),
    status: "published",
    featured: true,
    toolsUsed: ["CapCut", "Color grading"],
    displayOrder: 1,
    createdAt: "2026-06-02",
    media: [
      media("w1", 0, "video", 1.5, { duration: 47, caption: "Main edit" }),
      media("w1", 1, "image", 0.8, { caption: "Behind the scenes" }),
      media("w1", 2, "image", 1.33, { caption: "Behind the scenes" }),
    ],
  },
  {
    id: "w2",
    title: "Nocturne Series",
    slug: "nocturne-series",
    description: "A set of AI-generated portraits exploring low light and film grain.",
    categoryId: "cat-ai-portrait",
    category: categoryBySlug("ai-portrait"),
    status: "published",
    featured: false,
    toolsUsed: ["AI image generation", "Photo editing"],
    displayOrder: 2,
    createdAt: "2026-05-20",
    media: [media("w2", 0, "image", 0.75)],
  },
  {
    id: "w3",
    title: "Festival Poster — Aperture",
    slug: "festival-poster-aperture",
    description: "Typographic poster concept for a fictional photography festival.",
    categoryId: "cat-poster",
    category: categoryBySlug("poster"),
    status: "published",
    featured: true,
    toolsUsed: ["Canva", "Typography"],
    displayOrder: 3,
    createdAt: "2026-05-12",
    media: [media("w3", 0, "image", 0.66)],
  },
  {
    id: "w4",
    title: "Reframe",
    slug: "reframe",
    description: "A photo manipulation study layering three exposures into one scene.",
    categoryId: "cat-photo-edit",
    category: categoryBySlug("photo-edit"),
    status: "published",
    featured: false,
    toolsUsed: ["Layer-based editing", "Color theory"],
    displayOrder: 4,
    createdAt: "2026-04-30",
    media: [media("w4", 0, "image", 1.1)],
  },
  {
    id: "w5",
    title: "Glass City",
    slug: "glass-city",
    description: "An AI-generated cityscape series exploring reflection and scale.",
    categoryId: "cat-ai-image",
    category: categoryBySlug("ai-image"),
    status: "published",
    featured: false,
    toolsUsed: ["AI image generation"],
    displayOrder: 5,
    createdAt: "2026-04-18",
    media: [
      media("w5", 0, "image", 1.25),
      media("w5", 1, "image", 0.9),
    ],
  },
  {
    id: "w6",
    title: "Motion Study 04",
    slug: "motion-study-04",
    description: "A short AI-generated motion loop testing camera drift and light.",
    categoryId: "cat-ai-video",
    category: categoryBySlug("ai-video"),
    status: "published",
    featured: false,
    toolsUsed: ["AI video generation"],
    displayOrder: 6,
    createdAt: "2026-04-02",
    media: [media("w6", 0, "video", 1, { duration: 12 })],
  },
  {
    id: "w7",
    title: "Brand Sheet — Ori",
    slug: "brand-sheet-ori",
    description: "A minimal identity concept: mark, type system, and color palette.",
    categoryId: "cat-design",
    category: categoryBySlug("design"),
    status: "published",
    featured: false,
    toolsUsed: ["Canva", "Typography", "Color theory"],
    displayOrder: 7,
    createdAt: "2026-03-22",
    media: [media("w7", 0, "image", 1.5)],
  },
  {
    id: "w8",
    title: "Static / Noise",
    slug: "static-noise",
    description: "An unreleased visual experiment mixing scanned textures with digital type.",
    categoryId: "cat-experiments",
    category: categoryBySlug("experiments"),
    status: "published",
    featured: false,
    toolsUsed: ["Photo editing", "Visual composition"],
    displayOrder: 8,
    createdAt: "2026-03-10",
    media: [media("w8", 0, "image", 0.7)],
  },
];

// --- Data-access-shaped functions (mock implementations) ---
// Mirrors the eventual signatures of lib/data/works.ts + categories.ts,
// so pages/components already call the "real" shape of API.

export async function getCategories(): Promise<Category[]> {
  return [...CATEGORIES].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getPublishedWorks(categorySlug?: string): Promise<Work[]> {
  const works = WORKS.filter((w) => w.status === "published");
  const filtered = categorySlug
    ? works.filter((w) => w.category.slug === categorySlug)
    : works;
  return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getWorkBySlug(slug: string): Promise<Work | undefined> {
  return WORKS.find((w) => w.slug === slug && w.status === "published");
}

export async function getRelatedWorks(work: Work, limit = 4): Promise<Work[]> {
  return WORKS.filter(
    (w) => w.status === "published" && w.id !== work.id && w.categoryId === work.categoryId
  ).slice(0, limit);
}

export function sampleAspect(index: number): number {
  return ASPECTS[index % ASPECTS.length]!;
}

export async function getAdjacentWorks(
  work: Work
): Promise<{ previous?: Work; next?: Work }> {
  const published = WORKS.filter((w) => w.status === "published").sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const index = published.findIndex((w) => w.id === work.id);
  return {
    previous: index > 0 ? published[index - 1] : undefined,
    next: index >= 0 && index < published.length - 1 ? published[index + 1] : undefined,
  };
}
