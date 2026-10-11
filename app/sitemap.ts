import type { MetadataRoute } from "next";
import { getPublishedWorks } from "@/lib/data/mockWorks";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const works = await getPublishedWorks();

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...works.map((work) => ({
      url: `${base}/work/${work.slug}`,
      lastModified: work.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
