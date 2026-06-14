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
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: fullName || null,
    avatar_url: avatarUrl || null
  });

  if (profileError) throw new Error(`Unable to update profile: ${profileError.message}`);

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName || null,
      name: fullName || null,
      avatar_url: avatarUrl || null,
      picture: avatarUrl || null
    }
  });

  if (authError) throw new Error(`Unable to update auth profile: ${authError.message}`);

  revalidatePath("/");
  revalidatePath("/account");
  redirect("/account?saved=1");
}
