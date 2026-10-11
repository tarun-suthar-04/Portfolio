"use server";

import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";

// Server-only: generates a signature so the browser can upload directly to
// Cloudinary without ever seeing the API secret — ARCHITECTURE.md §5,
// CODING_RULES.md §10. Not yet called from any UI; wiring this into
// WorkForm's media section is the next milestone (see PROJECT_REPORT.md).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getUploadSignature() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const secret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!secret || !apiKey || !cloudName) {
    throw new Error("Cloudinary is not configured.");
  }

  const folder = "tarun-visual-works";
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    secret
  );

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
  };
}
