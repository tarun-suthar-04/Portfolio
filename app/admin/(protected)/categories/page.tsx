import { getCategories } from "@/lib/data/categories";
import { CategoryManager } from "./CategoryManager";

// Server Component: fetches the live category list from Supabase and passes
// it to the CategoryManager client component which handles mutations.
export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-6 font-display text-xl italic text-ink">Categories</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
