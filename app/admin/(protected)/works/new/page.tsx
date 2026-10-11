import { getCategories } from "@/lib/data/categories";
import { WorkForm } from "../WorkForm";

export default async function NewWorkPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-6 font-display text-xl italic text-ink">Add work</h1>
      <WorkForm categories={categories} />
    </div>
  );
}
