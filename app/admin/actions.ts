"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

    const { error } = await supabase.from("work").insert({
      title,
      slug,
      description: description || null,
      category_id: categoryId,
      status,
      featured,
      tools_used: toolsUsed,
      display_order: displayOrder,
    });

    if (error) {
      console.error("Failed to create work:", error);
      return { error: "Couldn't create the work." };
    }
  }

  redirect("/admin/works");
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