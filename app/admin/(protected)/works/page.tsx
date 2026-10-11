import Link from "next/link";

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

      <div className="divide-y divide-line border-y border-line">
        {works.length === 0 ? (
          <p className="py-8 text-sm text-graphite">
            No works yet. Add your first work.
          </p>
        ) : (
          works.map((work) => (
            <Link
              key={work.id}
              href={`/admin/works/${work.id}`}
              className="flex items-center justify-between gap-4 py-3 text-sm hover:text-accent"
            >
              <span className="flex-1">{work.title}</span>

              <span className="text-graphite">
                {work.category.name}
              </span>

              <span
                className={
                  "rounded-pill px-2 py-0.5 text-xs " +
                  (work.status === "published"
                    ? "bg-accent-soft text-accent"
                    : "bg-canvas text-graphite")
                }
              >
                {work.status}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}