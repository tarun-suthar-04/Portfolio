import { ImageResponse } from "next/og";
import { getWorkBySlug } from "@/lib/data/works";

export const runtime = "edge";
export const alt = "Portfolio project preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  const cover = work?.media.find((media) => media.type === "image");
  let imageUrl: string | undefined;
  if (cover) {
    try {
      const url = new URL(cover.url);
      if (url.protocol === "https:" && url.hostname === "res.cloudinary.com") {
        imageUrl = url.toString();
      }
    } catch {
      // Render the typography-only card if the stored cover URL is invalid.
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#F7F6F3",
          color: "#14140F",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            width={720}
            height={630}
            style={{ width: 720, height: 630, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px",
          }}
        >
          <div style={{ color: "#2F4538", fontSize: 20, letterSpacing: 3, textTransform: "uppercase" }}>
            Tarun / Visual Works
          </div>
          <div style={{ marginTop: 36, fontSize: 54, lineHeight: 1.08, fontStyle: "italic" }}>
            {work?.title ?? "Visual Works"}
          </div>
          {work?.category.name && (
            <div style={{ marginTop: 24, color: "#6B6A63", fontFamily: "Arial, sans-serif", fontSize: 22 }}>
              {work.category.name}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
