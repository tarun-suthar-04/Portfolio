import { notFound } from "next/navigation";
import { ViewerModal } from "@/components/viewer/ViewerModal";
import { WorkContent } from "@/components/viewer/WorkContent";
import { RelatedWork } from "@/components/viewer/RelatedWork";
import { getWorkBySlug, getAdjacentWorks, getRelatedWorks } from "@/lib/data/works";

// The (.) prefix intercepts navigation to /work/[slug] when it originates
// from within the (public) segment (i.e. clicking a card in the gallery),
// rendering this modal instead of the full page in work/[slug]/page.tsx —
// while the URL still updates to the real, shareable /work/[slug].
// See ARCHITECTURE.md §2.3.
export default async function WorkModal({
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
    <ViewerModal>
      <WorkContent work={work} previous={previous} next={next} inModal />
      <RelatedWork works={related} />
    </ViewerModal>
  );
}
