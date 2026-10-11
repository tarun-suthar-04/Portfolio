// Shared domain types. Defined once, imported everywhere — per CODING_RULES.md §2.
// These mirror the conceptual schema in ARCHITECTURE.md §3.2.

export type MediaType = "image" | "video";
export type WorkStatus = "draft" | "published";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
}

export interface Media {
  id: string;
  workId: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  publicId: string;
  altText?: string;
  caption?: string;
  duration?: number; // seconds, video only
  displayOrder: number;
  // Aspect ratio is required so the masonry grid can reserve correct space
  // before the asset loads (prevents layout shift — see DESIGN.md §7).
  aspectRatio: number; // width / height
}

export interface Work {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryId: string;
  category: Category;
  status: WorkStatus;
  featured: boolean;
  toolsUsed: string[];
  displayOrder: number;
  createdAt: string;
  media: Media[];
}
