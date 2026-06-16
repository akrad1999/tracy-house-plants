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

  if (!phone) {
    redirectWithProfileError("Enter a valid 10-digit phone number to continue.");
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
    country
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
      country
    }
  });

  if (authError) redirectWithProfileError(`Unable to update auth profile: ${authError.message}`);

  revalidatePath("/");
  revalidatePath("/account");
  redirect(nextPath || "/account?saved=1");
}
