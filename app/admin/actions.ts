"use server";

import { timingSafeEqual } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Media } from "@/types/work";

// Server Actions return a structured result rather than throwing raw
// errors to the client — CODING_RULES.md §8.

// ── AUTH ──────────────────────────────────────────────────────

export async function signIn(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Couldn't sign in. Check your email and password." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }

  redirect("/admin/works");
}

const adminRegistrationSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  setupToken: z.string().min(1).max(256),
});

function matchesSetupToken(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

// Publicly reachable only with a server-only setup token. Creates the first
// admin, then closes registration once an admin account already exists.
export async function registerAdmin(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = adminRegistrationSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    setupToken: formData.get("setupToken"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email, a password of at least 12 characters, and the setup token." };
  }

  const expectedToken = process.env.ADMIN_SETUP_TOKEN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missingConfig = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)",
    !expectedToken && "ADMIN_SETUP_TOKEN",
  ].filter((name): name is string => Boolean(name));
  if (!supabaseUrl || !serviceRoleKey || !expectedToken) {
    return {
      error: `Admin registration is not configured. Add ${missingConfig.join(", ")} to .env.local, then restart the dev server.`,
    };
  }

  if (!matchesSetupToken(parsed.data.setupToken, expectedToken)) {
    return { error: "Invalid setup token." };
  }

  const adminClient = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  for (let page = 1; ; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) {
      console.error("Failed to check for an existing admin:", error);
      return { error: "Couldn't check admin registration. Verify the Supabase server configuration." };
    }

    if (data.users.some((user) => user.app_metadata?.role === "admin")) {
      return { error: "An admin account already exists. Use the sign-in page." };
    }
    if (data.users.length < 100) break;
  }

  const { error: createError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });

  if (createError) {
    console.error("Failed to create the initial admin:", createError);
    return { error: "Couldn't create the admin account. The email may already be in use." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    console.error("Admin was created but sign-in failed:", signInError);
    return { error: "Account created. Please use the sign-in page." };
  }

  redirect("/admin/works");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ── WORKS ─────────────────────────────────────────────────────

export async function saveWork(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();

  // Verify the user is authenticated before modifying data.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in to save a work." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const toolsUsedRaw = String(formData.get("toolsUsed") ?? "");
  const status = String(formData.get("status") ?? "draft");
  const featured = formData.get("featured") === "on";

  if (!title) {
    return { error: "Title is required." };
  }

  if (!categoryId) {
    return { error: "Category is required." };
  }

  if (status !== "draft" && status !== "published") {
    return { error: "Invalid work status." };
  }

  if (!id && status === "published") {
    return { error: "Save the work as a draft first, add media, then publish it." };
  }

  if (id && status === "published") {
    const { count, error } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("work_id", id);
    if (error) {
      console.error("Failed to check work media before publishing:", error);
      return { error: "Couldn't verify the work's media." };
    }
    if (!count) {
      return { error: "Add at least one image or video before publishing." };
    }
  }

  const toolsUsed = toolsUsedRaw
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean);

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    return { error: "A valid title is required to create a slug." };
  }

  if (id) {
    // Update existing work
    const { error } = await supabase
      .from("work")
      .update({
        title,
        slug,
        description: description || null,
        category_id: categoryId,
        status,
        featured,
        tools_used: toolsUsed,
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to update work:", error);
      return { error: "Couldn't update the work." };
    }
  } else {
    // Insert new work — append after the current last display_order
    const { data: lastWork } = await supabase
      .from("work")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const displayOrder = (lastWork?.display_order ?? 0) + 1;

    const { data: createdWork, error } = await supabase.from("work").insert({
      title,
      slug,
      description: description || null,
      category_id: categoryId,
      status,
      featured,
      tools_used: toolsUsed,
      display_order: displayOrder,
    }).select("id").single();

    if (error || !createdWork) {
      console.error("Failed to create work:", error);
      return { error: "Couldn't create the work." };
    }

    // Save the metadata first; add images/videos from the edit screen so the
    // signed upload is always scoped to an existing work ID.
    redirect(`/admin/works/${createdWork.id}`);
  }

  redirect("/admin/works");
}

const mediaInputSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url().max(2048),
  publicId: z.string().min(1).max(512),
  width: z.number().int().positive().max(100000),
  height: z.number().int().positive().max(100000),
  duration: z.number().finite().nonnegative().max(86400).optional(),
});

export async function saveWorkMedia(
  workId: string,
  input: unknown
): Promise<{ error: string } | { media: Media }> {
  if (!z.string().uuid().safeParse(workId).success) {
    return { error: "Invalid work." };
  }

  const parsed = mediaInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Cloudinary returned invalid media details." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in as an admin to save media." };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let assetUrl: URL;
  try {
    assetUrl = new URL(parsed.data.url);
  } catch {
    return { error: "Cloudinary returned an invalid URL." };
  }
  if (
    !cloudName ||
    assetUrl.protocol !== "https:" ||
    assetUrl.hostname !== "res.cloudinary.com" ||
    !assetUrl.pathname.startsWith(`/${cloudName}/`)
  ) {
    return { error: "Media must come from this project's Cloudinary account." };
  }

  const { data: work, error: workError } = await supabase
    .from("work")
    .select("id")
    .eq("id", workId)
    .maybeSingle();
  if (workError || !work) {
    return { error: "Couldn't find this work." };
  }

  const { count: mediaCount, error: countError } = await supabase
    .from("media")
    .select("id", { count: "exact", head: true })
    .eq("work_id", workId);
  if (countError) {
    console.error("Failed to check work media limit:", countError);
    return { error: "Couldn't verify the work's media limit." };
  }
  if ((mediaCount ?? 0) >= 30) {
    return { error: "A work can have at most 30 media items." };
  }

  const { data: lastMedia, error: orderError } = await supabase
    .from("media")
    .select("display_order")
    .eq("work_id", workId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (orderError) {
    console.error("Failed to read media order:", orderError);
    return { error: "Couldn't save the media item." };
  }

  const { data, error } = await supabase
    .from("media")
    .insert({
      work_id: workId,
      type: parsed.data.type,
      url: assetUrl.toString(),
      thumbnail_url: null,
      public_id: parsed.data.publicId,
      alt_text: null,
      caption: null,
      duration: parsed.data.duration ?? null,
      display_order: (lastMedia?.display_order ?? 0) + 1,
      aspect_ratio: parsed.data.width / parsed.data.height,
    })
    .select("id, work_id, type, url, thumbnail_url, public_id, alt_text, caption, duration, display_order, aspect_ratio")
    .single();

  if (error || !data) {
    console.error("Failed to save media:", error);
    return { error: "Upload completed, but media details could not be saved." };
  }

  revalidatePath("/");
  revalidatePath(`/admin/works/${workId}`);
  return {
    media: {
      id: data.id,
      workId: data.work_id,
      type: data.type,
      url: data.url,
      thumbnailUrl: data.thumbnail_url ?? undefined,
      publicId: data.public_id,
      altText: data.alt_text ?? undefined,
      caption: data.caption ?? undefined,
      duration: data.duration ?? undefined,
      displayOrder: data.display_order,
      aspectRatio: data.aspect_ratio,
    },
  };
}

export async function deleteWorkMedia(
  workId: string,
  mediaId: string
): Promise<{ error: string } | { success: true }> {
  if (!z.string().uuid().safeParse(workId).success || !z.string().uuid().safeParse(mediaId).success) {
    return { error: "Invalid work or media." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in as an admin to delete media." };
  }

  const { data: media, error: mediaError } = await supabase
    .from("media")
    .select("id, work_id, type, url, public_id")
    .eq("id", mediaId)
    .eq("work_id", workId)
    .maybeSingle();
  if (mediaError || !media) {
    return { error: "Couldn't find this media item." };
  }

  const { data: work, error: workError } = await supabase
    .from("work")
    .select("slug, status")
    .eq("id", workId)
    .maybeSingle();
  if (workError || !work) {
    return { error: "Couldn't find this work." };
  }

  if (work.status === "published") {
    const { count, error: countError } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("work_id", workId);
    if (countError) {
      console.error("Failed to check remaining work media:", countError);
      return { error: "Couldn't verify whether this work can lose its media." };
    }
    if ((count ?? 0) <= 1) {
      return { error: "Unpublish this work before deleting its last media item." };
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return { error: "Cloudinary is not configured on the server; media was not deleted." };
  }

  let assetUrl: URL;
  try {
    assetUrl = new URL(media.url);
  } catch {
    return { error: "This media record has an invalid Cloudinary URL." };
  }
  if (
    assetUrl.protocol !== "https:" ||
    assetUrl.hostname !== "res.cloudinary.com" ||
    !assetUrl.pathname.startsWith(`/${cloudName}/`)
  ) {
    return { error: "This media record does not belong to the configured Cloudinary account." };
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  try {
    const result = await cloudinary.uploader.destroy(media.public_id, {
      resource_type: media.type,
      invalidate: true,
    });
    if (result.result !== "ok" && result.result !== "not found") {
      console.error("Cloudinary did not delete the asset:", result.result);
      return { error: "Cloudinary couldn't delete this media item." };
    }
  } catch (error) {
    console.error("Cloudinary media deletion failed:", error);
    return { error: "Cloudinary couldn't delete this media item; the database record was kept." };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("media")
    .delete()
    .eq("id", mediaId)
    .eq("work_id", workId)
    .select("id")
    .maybeSingle();
  if (deleteError || !deleted) {
    console.error("Cloudinary asset was deleted, but its media row could not be removed:", deleteError);
    return { error: "The Cloudinary asset was removed, but its database record could not be deleted. Refresh and retry." };
  }

  revalidatePath("/");
  revalidatePath(`/work/${work.slug}`);
  revalidatePath(`/admin/works/${workId}`);
  return { success: true };
}

export async function moveWorkMedia(
  workId: string,
  mediaId: string,
  direction: "up" | "down"
): Promise<{ error: string } | { success: true }> {
  if (
    !z.string().uuid().safeParse(workId).success ||
    !z.string().uuid().safeParse(mediaId).success ||
    !z.enum(["up", "down"]).safeParse(direction).success
  ) {
    return { error: "Invalid work, media, or direction." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in as an admin to reorder media." };
  }

  const { data: work, error: workError } = await supabase
    .from("work")
    .select("slug")
    .eq("id", workId)
    .maybeSingle();
  if (workError || !work) {
    return { error: "Couldn't find this work." };
  }

  const { data: rows, error: rowsError } = await supabase
    .from("media")
    .select("id, display_order")
    .eq("work_id", workId)
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });
  if (rowsError) {
    console.error("Failed to load media order:", rowsError);
    return { error: "Couldn't load this work's media order." };
  }

  const mediaRows = rows ?? [];
  const currentIndex = mediaRows.findIndex((row) => row.id === mediaId);
  if (currentIndex < 0) {
    return { error: "Couldn't find this media item." };
  }
  const neighborIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (neighborIndex < 0 || neighborIndex >= mediaRows.length) {
    return { success: true };
  }

  const current = mediaRows[currentIndex];
  const neighbor = mediaRows[neighborIndex];
  if (!current || !neighbor) {
    return { error: "Couldn't find the adjacent media item." };
  }
  const temporaryOrder = Math.min(0, ...mediaRows.map((row) => row.display_order)) - 1;

  async function setDisplayOrder(id: string, displayOrder: number) {
    const { data, error } = await supabase
      .from("media")
      .update({ display_order: displayOrder })
      .eq("id", id)
      .eq("work_id", workId)
      .select("id")
      .maybeSingle();
    return !error && Boolean(data);
  }

  if (!(await setDisplayOrder(current.id, temporaryOrder))) {
    return { error: "Couldn't start reordering this media item." };
  }
  if (!(await setDisplayOrder(neighbor.id, current.display_order))) {
    await setDisplayOrder(current.id, current.display_order);
    return { error: "Couldn't reorder this media item; the original order was restored." };
  }
  if (!(await setDisplayOrder(current.id, neighbor.display_order))) {
    const restoredNeighbor = await setDisplayOrder(neighbor.id, neighbor.display_order);
    const restoredCurrent = await setDisplayOrder(current.id, current.display_order);
    if (!restoredNeighbor || !restoredCurrent) {
      console.error("Failed to restore media order after an incomplete reorder.");
    }
    return { error: "Couldn't finish reordering this media item." };
  }

  revalidatePath("/");
  revalidatePath(`/work/${work.slug}`);
  revalidatePath(`/admin/works/${workId}`);
  return { success: true };
}

export async function setWorkStatus(
  workId: string,
  targetStatus: string
): Promise<{ error: string } | { status: "draft" | "published" }> {
  if (!z.string().uuid().safeParse(workId).success) {
    return { error: "Invalid work." };
  }
  const parsedStatus = z.enum(["draft", "published"]).safeParse(targetStatus);
  if (!parsedStatus.success) {
    return { error: "Invalid work status." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in as an admin to change publish status." };
  }

  const { data: work, error: workError } = await supabase
    .from("work")
    .select("slug, status")
    .eq("id", workId)
    .maybeSingle();
  if (workError || !work) {
    return { error: "Couldn't find this work." };
  }
  if (work.status === parsedStatus.data) {
    return { status: work.status };
  }

  if (parsedStatus.data === "published") {
    const { count, error: countError } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("work_id", workId);
    if (countError) {
      console.error("Failed to check work media before publishing:", countError);
      return { error: "Couldn't verify this work's media." };
    }
    if (!count) {
      return { error: "Add at least one image or video before publishing." };
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("work")
    .update({ status: parsedStatus.data })
    .eq("id", workId)
    .select("id")
    .maybeSingle();
  if (updateError || !updated) {
    console.error("Failed to change work status:", updateError);
    return { error: "Couldn't change the work's publish status." };
  }

  revalidatePath("/");
  revalidatePath("/admin/works");
  revalidatePath(`/work/${work.slug}`);
  return { status: parsedStatus.data };
}

export async function moveCategory(
  categoryId: string,
  direction: "up" | "down"
): Promise<{ error: string } | { success: true }> {
  if (
    !z.string().uuid().safeParse(categoryId).success ||
    !z.enum(["up", "down"]).safeParse(direction).success
  ) {
    return { error: "Invalid category or direction." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in as an admin to reorder categories." };
  }

  const { data: rows, error } = await supabase
    .from("category")
    .select("id, display_order")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) {
    console.error("Failed to load category order:", error);
    return { error: "Couldn't load category order." };
  }

  const categories = rows ?? [];
  const currentIndex = categories.findIndex((category) => category.id === categoryId);
  if (currentIndex < 0) {
    return { error: "Couldn't find this category." };
  }
  const neighborIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (neighborIndex < 0 || neighborIndex >= categories.length) {
    return { success: true };
  }

  const current = categories[currentIndex];
  const neighbor = categories[neighborIndex];
  if (!current || !neighbor) {
    return { error: "Couldn't find the adjacent category." };
  }
  const temporaryOrder = Math.min(0, ...categories.map((category) => category.display_order)) - 1;

  async function setDisplayOrder(id: string, displayOrder: number) {
    const { data, error: updateError } = await supabase
      .from("category")
      .update({ display_order: displayOrder })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    return !updateError && Boolean(data);
  }

  if (!(await setDisplayOrder(current.id, temporaryOrder))) {
    return { error: "Couldn't start reordering this category." };
  }
  if (!(await setDisplayOrder(neighbor.id, current.display_order))) {
    await setDisplayOrder(current.id, current.display_order);
    return { error: "Couldn't reorder this category; the original order was restored." };
  }
  if (!(await setDisplayOrder(current.id, neighbor.display_order))) {
    const restoredNeighbor = await setDisplayOrder(neighbor.id, neighbor.display_order);
    const restoredCurrent = await setDisplayOrder(current.id, current.display_order);
    if (!restoredNeighbor || !restoredCurrent) {
      console.error("Failed to restore category order after an incomplete reorder.");
    }
    return { error: "Couldn't finish reordering this category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateMediaAltText(
  workId: string,
  mediaId: string,
  value: string
): Promise<{ error: string } | { success: true; altText: string | null }> {
  if (
    !z.string().uuid().safeParse(workId).success ||
    !z.string().uuid().safeParse(mediaId).success
  ) {
    return { error: "Invalid work or media." };
  }
  const parsedAltText = z.string().trim().max(500).safeParse(value);
  if (!parsedAltText.success) {
    return { error: "Alt text must be 500 characters or fewer." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in as an admin to edit media." };
  }

  const { data: media, error: mediaError } = await supabase
    .from("media")
    .select("id")
    .eq("id", mediaId)
    .eq("work_id", workId)
    .maybeSingle();
  if (mediaError || !media) {
    return { error: "Couldn't find this media item." };
  }

  const { data: work, error: workError } = await supabase
    .from("work")
    .select("slug")
    .eq("id", workId)
    .maybeSingle();
  if (workError || !work) {
    return { error: "Couldn't find this work." };
  }

  const altText = parsedAltText.data || null;
  const { data: updated, error: updateError } = await supabase
    .from("media")
    .update({ alt_text: altText })
    .eq("id", mediaId)
    .eq("work_id", workId)
    .select("id")
    .maybeSingle();
  if (updateError || !updated) {
    console.error("Failed to update media alt text:", updateError);
    return { error: "Couldn't save the alt text." };
  }

  revalidatePath("/");
  revalidatePath(`/work/${work.slug}`);
  revalidatePath(`/admin/works/${workId}`);
  return { success: true, altText };
}

export async function deleteWork(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in to delete a work." };
  }

  // Media rows cascade-delete via the FK constraint (on delete cascade),
  // so we only need to delete the work row itself.
  const { error } = await supabase.from("work").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete work:", error);
    return { error: "Couldn't delete the work." };
  }

  redirect("/admin/works");
}

// ── CATEGORIES ────────────────────────────────────────────────

export async function createCategory(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in to create a category." };
  }

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Category name is required." };
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    return { error: "A valid name is required to create a slug." };
  }

  // Append after the current highest display_order
  const { data: lastCategory } = await supabase
    .from("category")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const displayOrder = (lastCategory?.display_order ?? 0) + 1;

  const { error } = await supabase.from("category").insert({
    name,
    slug,
    display_order: displayOrder,
  });

  if (error) {
    // Unique constraint violation = slug already exists
    if (error.code === "23505") {
      return { error: `A category with the name "${name}" already exists.` };
    }
    console.error("Failed to create category:", error);
    return { error: "Couldn't create the category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You must be signed in to delete a category." };
  }

  // Block delete if any works still belong to this category.
  // The FK constraint (on delete restrict) would also reject it at the DB
  // level, but we surface a clear message here first.
  const { count } = await supabase
    .from("work")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      error: `This category has ${count} work${count === 1 ? "" : "s"} assigned to it. Move or delete those works first.`,
    };
  }

  const { error } = await supabase.from("category").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete category:", error);
    return { error: "Couldn't delete the category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}
