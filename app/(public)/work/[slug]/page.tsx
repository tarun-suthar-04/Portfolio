import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/gallery/SiteHeader";
import { WorkContent } from "@/components/viewer/WorkContent";
import { RelatedWork } from "@/components/viewer/RelatedWork";
import { getWorkBySlug, getAdjacentWorks, getRelatedWorks } from "@/lib/data/works";

// This is what renders on a direct visit to /work/[slug] — e.g. a shared
// link or a search-engine crawl — full page, fully server-rendered, no
// dependency on having come from the gallery. See ARCHITECTURE.md §2.3.
export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const [{ previous, next }, related] = await Promise.all([
    getAdjacentWorks(work),
    getRelatedWorks(work),
  ]);

  return (
    <main>
      <SiteHeader />
      <WorkContent work={work} previous={previous} next={next} />
      <RelatedWork works={related} />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) return {};

  return {
    title: `${work.title} — Tarun / Visual Works`,
    description: work.description,
    openGraph: {
      title: work.title,
      description: work.description,
    },
  };
}
