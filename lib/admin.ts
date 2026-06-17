import type { SupabaseClient, User } from "@supabase/supabase-js";

export const adminEmails = ["radhibanu@yahoo.com", "akrad1999@gmail.com"] as const;

export function isApprovedAdminEmail(email?: string | null) {
  return Boolean(email && adminEmails.includes(email.toLowerCase() as (typeof adminEmails)[number]));
}

export async function isAdminUser(supabase: SupabaseClient, user: User | null) {
  if (!user) return false;

  const approvedEmail = isApprovedAdminEmail(user.email);
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  return approvedEmail || profile?.role === "admin";
}
