"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithProfileError(message: string): never {
  redirect(`/account?setup=1&error=${encodeURIComponent(message)}`);
}

function getSafeNextPath(value: FormDataEntryValue | null) {
  const nextPath = String(value ?? "").trim();
  return nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "";
}

function getTenDigitPhone(value: FormDataEntryValue | null) {
  const phone = String(value ?? "").replace(/\D/g, "");
  return phone.length === 10 ? phone : null;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect("/sign-in?next=/account");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = getTenDigitPhone(formData.get("phone"));
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const addressLine2 = String(formData.get("addressLine2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const country = String(formData.get("country") ?? "United States").trim() || "United States";
  const nextPath = getSafeNextPath(formData.get("nextPath"));
  const avatarFile = formData.get("avatarFile");
  let avatarUrl: string | null = null;

  if (!phone) {
    redirectWithProfileError("Enter a valid 10-digit phone number to continue.");
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    redirectWithProfileError(`Unable to load profile: ${existingProfileError.message}`);
  }

  avatarUrl = existingProfile?.avatar_url ?? null;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith("image/")) {
      redirectWithProfileError("Profile picture must be an image.");
    }

    if (avatarFile.size > 5 * 1024 * 1024) {
      redirectWithProfileError("Profile picture must be smaller than 5MB.");
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
      redirectWithProfileError(`Unable to upload profile picture: ${uploadError.message}`);
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
    phone,
    address_line1: addressLine1 || null,
    address_line2: addressLine2 || null,
    city: city || null,
    state: state || null,
    postal_code: postalCode || null,
    country,
    avatar_url: avatarUrl
  });

  if (profileError) redirectWithProfileError(`Unable to update profile: ${profileError.message}`);

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName || null,
      name: fullName || null,
      phone,
      address_line1: addressLine1 || null,
      address_line2: addressLine2 || null,
      city: city || null,
      state: state || null,
      postal_code: postalCode || null,
      country,
      avatar_url: avatarUrl,
      picture: avatarUrl
    }
  });

  if (authError) redirectWithProfileError(`Unable to update auth profile: ${authError.message}`);

  revalidatePath("/");
  revalidatePath("/account");
  redirect(nextPath || "/account?saved=1");
}
