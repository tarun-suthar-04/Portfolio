import Link from "next/link";
import { WorkList } from "@/components/admin/WorkList";
import { getAdminWorks } from "@/lib/data/adminWorks";

export default async function AdminWorksPage() {
  const works = await getAdminWorks();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl italic text-ink">Works</h1>

        <Link
          href="/admin/works/new"
          className="rounded bg-accent px-4 py-2 text-sm text-paper"
        >
          Add work
        </Link>
      </div>

      <WorkList
        items={works.map((work) => ({
          id: work.id,
          title: work.title,
          status: work.status,
          categoryName: work.category.name,
          categorySlug: work.category.slug,
        }))}
      />
    </div>
  );
}
