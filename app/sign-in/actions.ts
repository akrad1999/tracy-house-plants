"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

function getSafeNextPath(value: FormDataEntryValue | null) {
  const nextPath = String(value ?? "").trim();
  return nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/account";
}

function getTenDigitPhone(value: FormDataEntryValue | null) {
  const phone = String(value ?? "").replace(/\D/g, "");
  return phone.length === 10 ? phone : null;
}

function getOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://tracyhouseplants.com";
}

export async function signInWithPassword(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(formData.get("nextPath"));

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/sign-in?error=${encodeURIComponent(error?.message ?? "Unable to sign in.")}&next=${encodeURIComponent(nextPath)}`);
  }

  const { data: profile } = await supabase.from("profiles").select("phone").eq("id", data.user.id).maybeSingle();

  if (!profile?.phone) {
    redirect(`/account?setup=1&next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath);
}

export async function signUpWithPassword(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const serviceSupabase = createSupabaseServiceRoleClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
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
    redirect(`/sign-in?mode=signup&error=${encodeURIComponent("Enter a valid 10-digit phone number.")}&next=${encodeURIComponent(nextPath)}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getOrigin()}/auth/callback?next=${encodeURIComponent(nextPath)}`,
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
    }
  });

  if (error || !data.user) {
    redirect(`/sign-in?mode=signup&error=${encodeURIComponent(error?.message ?? "Unable to create account.")}&next=${encodeURIComponent(nextPath)}`);
  }

  const { error: profileError } = await serviceSupabase.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name: fullName || null,
    phone,
    address_line1: addressLine1 || null,
    address_line2: addressLine2 || null,
    city: city || null,
    state: state || null,
    postal_code: postalCode || null,
    country
  });

  if (profileError) {
    redirect(`/sign-in?mode=signup&error=${encodeURIComponent(profileError.message)}&next=${encodeURIComponent(nextPath)}`);
  }

  if (!data.session) {
    redirect(`/sign-in?message=${encodeURIComponent("Check your email to confirm your account, then sign in.")}&next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath);
}
