"use server";

import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Server-only signature generation. The browser receives only the short-lived
// upload signature and public API details; the Cloudinary API secret stays here.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getUploadSignature(workId: string) {
  if (!z.string().uuid().safeParse(workId).success) {
    return { error: "Invalid work." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in as an admin to upload media." };
  }

  const { data: work, error: workError } = await supabase
    .from("work")
    .select("id")
    .eq("id", workId)
    .maybeSingle();
  if (workError || !work) {
    return { error: "Couldn't find this work." };
  }

  const secret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!secret || !apiKey || !cloudName) {
    return { error: "Cloudinary is not configured on the server." };
  }

  const folder = `tarun-visual-works/${workId}`;
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
