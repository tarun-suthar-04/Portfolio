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
    media: (row.media ?? []).map(mapMedia),
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

export async function getPublishedWorks(
  categorySlug?: string
): Promise<Work[]> {
  const supabase = await createClient();

  // Filtering on a joined relation column via .eq("category.slug", ...) does
  // not work in PostgREST — resolve the slug to a category_id first, then
  // filter the work table directly.
  let categoryId: string | undefined;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("category")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (!cat) return []; // unknown slug → empty gallery, not an error
    categoryId = cat.id;
  }

  let query = supabase
    .from("work")
    .select(WORK_SELECT)
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch published works:", error);
    throw new Error("Failed to load works.");
  }

  return ((data ?? []) as unknown as WorkRow[]).map(mapWork);
}

export async function getWorkBySlug(
  slug: string
): Promise<Work | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("work")
    .select(WORK_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch work:", error);
    throw new Error("Failed to load work.");
  }

  return data ? mapWork(data as unknown as WorkRow) : undefined;
}

export async function getRelatedWorks(
  work: Work,
  limit = 4
): Promise<Work[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("work")
    .select(WORK_SELECT)
    .eq("status", "published")
    .eq("category_id", work.categoryId)
    .neq("id", work.id)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch related works:", error);
    throw new Error("Failed to load related works.");
  }

  return ((data ?? []) as unknown as WorkRow[]).map(mapWork);
}

export async function getAdjacentWorks(
  work: Work
): Promise<{ previous?: Work; next?: Work }> {
  const supabase = await createClient();

  // Two targeted queries instead of a full table scan.
  // "Previous" = the nearest published work with a lower display_order.
  // "Next"     = the nearest published work with a higher display_order.
  const [prevResult, nextResult] = await Promise.all([
    supabase
      .from("work")
      .select(WORK_SELECT)
      .eq("status", "published")
      .lt("display_order", work.displayOrder)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("work")
      .select(WORK_SELECT)
      .eq("status", "published")
      .gt("display_order", work.displayOrder)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (prevResult.error) {
    console.error("Failed to fetch previous work:", prevResult.error);
  }
  if (nextResult.error) {
    console.error("Failed to fetch next work:", nextResult.error);
  }

  return {
    previous: prevResult.data
      ? mapWork(prevResult.data as unknown as WorkRow)
      : undefined,
    next: nextResult.data
      ? mapWork(nextResult.data as unknown as WorkRow)
      : undefined,
  };
}