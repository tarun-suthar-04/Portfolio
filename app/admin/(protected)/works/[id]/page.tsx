import { notFound } from "next/navigation";
import { getCategories } from "@/lib/data/categories";
import { getWorkById } from "@/lib/data/adminWorks";
import { deleteWork } from "@/app/admin/actions";
import { DeleteWorkForm } from "@/components/admin/DeleteWorkForm";
import { WorkForm } from "../WorkForm";

export default async function EditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, work] = await Promise.all([
    getCategories(),
    getWorkById(id),
  ]);

  if (!work) notFound();


  return (
    <div>
      <h1 className="mb-6 font-display text-xl italic text-ink">Edit work</h1>
      <WorkForm categories={categories} work={work} />

      {/* Delete — shown below the form with a clear visual separation */}
      <div className="mt-12 border-t border-line pt-8">
        <p className="mb-3 text-sm text-graphite">
          Deleting a work permanently removes it and all its media. This cannot
          be undone.
        </p>
        <DeleteWorkForm
          workTitle={work.title}
          action={async () => {
            "use server";
            await deleteWork(work.id);
          }}
        />
      </div>
    </div>
  );
}
