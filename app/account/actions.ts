"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/account");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const avatarFile = formData.get("avatarFile");
  let avatarUrl: string | null = null;

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw new Error(`Unable to load profile: ${existingProfileError.message}`);
  }

  avatarUrl = existingProfile?.avatar_url ?? null;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      throw new Error("Profile picture must be an image.");
    }

    if (avatarFile.size > 5 * 1024 * 1024) {
      throw new Error("Profile picture must be smaller than 5MB.");
    }

    const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const avatarPath = `${user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-avatars")
      .upload(avatarPath, avatarFile, {
        upsert: true,
        contentType: avatarFile.type
      });

    if (uploadError) {
      throw new Error(`Unable to upload profile picture: ${uploadError.message}`);
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("profile-avatars").getPublicUrl(avatarPath);
    avatarUrl = `${publicUrl}?v=${Date.now()}`;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: fullName || null,
    phone: phone || null,
    avatar_url: avatarUrl
  });

  if (profileError) throw new Error(`Unable to update profile: ${profileError.message}`);

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName || null,
      name: fullName || null,
      phone: phone || null,
      avatar_url: avatarUrl,
      picture: avatarUrl
    }
  });

  if (authError) throw new Error(`Unable to update auth profile: ${authError.message}`);

  revalidatePath("/");
  revalidatePath("/account");
  redirect("/account?saved=1");
}
