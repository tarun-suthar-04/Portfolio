import { createClient } from "@/lib/supabase/server";
import type { Category, Media, Work } from "@/types/work";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
};

type MediaRow = {
  id: string;
  work_id: string;
  type: "image" | "video";
  url: string;
  thumbnail_url: string | null;
  public_id: string;
  alt_text: string | null;
  caption: string | null;
  duration: number | null;
  display_order: number;
  aspect_ratio: number;
};

type WorkRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string;
  status: "draft" | "published";
  featured: boolean;
  tools_used: string[];
  display_order: number;
  created_at: string;
  category: CategoryRow;
  media: MediaRow[];
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    displayOrder: row.display_order,
  };
}

function mapMedia(row: MediaRow): Media {
  return {
    id: row.id,
    workId: row.work_id,
    type: row.type,
    url: row.url,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    publicId: row.public_id,
    altText: row.alt_text ?? undefined,
    caption: row.caption ?? undefined,
    duration: row.duration ?? undefined,
    displayOrder: row.display_order,
    aspectRatio: row.aspect_ratio,
  };
}

function mapWork(row: WorkRow): Work {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? undefined,
    categoryId: row.category_id,
    category: mapCategory(row.category),
    status: row.status,
    featured: row.featured,
    toolsUsed: row.tools_used ?? [],
    displayOrder: row.display_order,
    createdAt: row.created_at,
    media: (row.media ?? [])
      .map(mapMedia)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

const WORK_SELECT = `
  id,
  title,
  slug,
  description,
  category_id,
  status,
  featured,
  tools_used,
  display_order,
  created_at,
  category:category_id (
    id,
    name,
    slug,
    description,
    display_order
  ),
  media (
    id,
    work_id,
    type,
    url,
    thumbnail_url,
    public_id,
    alt_text,
    caption,
    duration,
    display_order,
    aspect_ratio
  )
`;

export async function getWorkById(id: string): Promise<Work | undefined> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("work")
    .select(WORK_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch work:", error);
    throw new Error("Failed to load work.");
  }

  return data ? mapWork(data as unknown as WorkRow) : undefined;
}

export async function getAdminWorks(): Promise<Work[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("work")
    .select(WORK_SELECT)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch admin works:", error);
    throw new Error("Failed to load works.");
  }

  return ((data ?? []) as unknown as WorkRow[]).map(mapWork);
}