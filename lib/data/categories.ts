import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/work";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
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

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("category")
    .select("id, name, slug, description, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories:", error);
    throw new Error("Failed to load categories.");
  }

  return (data ?? []).map(mapCategory);
}