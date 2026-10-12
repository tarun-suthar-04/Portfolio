import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// Reads published works directly from Supabase — no mock data.
// NEXT_PUBLIC_SITE_URL must be set in .env.local / deployment env vars.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredSiteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be configured to generate the sitemap.");
  }

  let base: string;
  try {
    const siteUrl = new URL(configuredSiteUrl);
    if (siteUrl.protocol !== "https:" && siteUrl.protocol !== "http:") {
      throw new Error("Unsupported protocol");
    }
    base = siteUrl.origin;
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTP or HTTPS URL.");
  }

  let slugRows: { slug: string; created_at: string }[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("work")
      .select("slug, created_at")
      .eq("status", "published")
      .order("display_order", { ascending: true });
    if (error) {
      console.error("Failed to fetch published works for sitemap:", error);
    } else {
      slugRows = data ?? [];
    }
  } catch {
    // If Supabase is unreachable at build time, fall back to just the homepage
    // so the build doesn't fail in CI / preview deployments without credentials.
    console.error("Supabase was unavailable while generating the sitemap.");
  }

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...slugRows.map((work) => ({
      url: `${base}/work/${work.slug}`,
      lastModified: work.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
