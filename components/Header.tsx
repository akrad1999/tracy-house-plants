import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { User } from "@supabase/supabase-js";
import { ProfileLink } from "@/components/auth/ProfileLink";
import { CartLink } from "@/components/cart/CartLink";
import { isApprovedAdminEmail } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/plants", label: "Plants" }
];

type ProfileRow = {
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

export async function Header() {
  let user: User | null = null;

  let profile: ProfileRow | null = null;
  let isAdmin = false;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser();

    user = currentUser;

    if (user) {
      const { data } = await supabase.from("profiles").select("full_name, avatar_url, role").eq("id", user.id).maybeSingle();
      profile = data;
      isAdmin = profile?.role === "admin" || isApprovedAdminEmail(user.email);
    }
  } catch {
    user = null;
  }

  const nameFromMetadata =
    typeof user?.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user?.user_metadata.name === "string"
        ? user.user_metadata.name
        : null;
  const avatarFromMetadata =
    typeof user?.user_metadata.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata.picture === "string"
        ? user.user_metadata.picture
        : null;
  const displayName = profile?.full_name ?? nameFromMetadata ?? "Account";
  const avatarUrl = profile?.avatar_url ?? avatarFromMetadata;

  return (
    <header className="sticky top-0 z-50 border-b border-[#c8ba7e]/40 bg-[#f6f2eb]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/auntys-plants-logo.png"
            alt="Aunty's Plants Tracy"
            width={72}
            height={72}
            priority
            className="size-14 rounded-full object-cover shadow-sm sm:size-16"
          />
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Primary navigation" className="flex items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-semibold text-[#4e5026] transition hover:bg-[#4e5026] hover:text-[#f6f2eb] sm:px-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Suspense
            fallback={
              <Link
                href={user ? "/account" : "/sign-in?next=/account"}
                aria-label={user ? `Profile for ${displayName}` : "Log in"}
                className="inline-flex size-11 items-center justify-center rounded-full border border-[#c8ba7e]/60 bg-white text-sm font-black text-[#4e5026] shadow-sm transition hover:border-[#4e5026]/50"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#c8ba7e] text-[10px] font-black text-[#49392c]">
                  {user ? displayName.charAt(0).toUpperCase() : "Log in"}
                </span>
              </Link>
            }
          >
            <ProfileLink
              isSignedIn={Boolean(user)}
              isAdmin={isAdmin}
              label={user ? `Profile for ${displayName}` : "Log in"}
              className="inline-flex size-11 items-center justify-center rounded-full border border-[#c8ba7e]/60 bg-white text-sm font-black text-[#4e5026] shadow-sm transition hover:border-[#4e5026]/50"
            >
              {user && avatarUrl ? (
                <img src={avatarUrl} alt="" className="size-8 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="flex size-8 items-center justify-center rounded-full bg-[#c8ba7e] text-[10px] font-black text-[#49392c]">
                  {user ? displayName.charAt(0).toUpperCase() : "Log in"}
                </span>
              )}
            </ProfileLink>
          </Suspense>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
