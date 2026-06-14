import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/plants", label: "Plants" },
  { href: "/cart", label: "Cart" }
];

type ProfileRow = {
  full_name: string | null;
  avatar_url: string | null;
};

export async function Header() {
  let user: User | null = null;

  let profile: ProfileRow | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser();

    user = currentUser;

    if (user) {
      const { data } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle();
      profile = data;
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
    <header className="sticky top-0 z-50 border-b border-[#7a5c2f]/15 bg-[#f8f0df]/95 backdrop-blur">
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
          <nav aria-label="Primary navigation" className="flex items-center gap-1 rounded-full bg-white/55 p-1 shadow-sm">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-semibold text-[#31551f] transition hover:bg-[#31551f] hover:text-white sm:px-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href={user ? "/account" : "/sign-in?next=/account"}
            aria-label={user ? `Profile for ${displayName}` : "Log in"}
            className="inline-flex size-11 items-center justify-center rounded-full border border-[#7a5c2f]/15 bg-white text-sm font-black text-[#31551f] shadow-sm transition hover:border-[#31551f]/40"
          >
            {user && avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-8 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-[#e7d7b6] text-xs text-[#31551f]">
                {user ? displayName.charAt(0).toUpperCase() : "Log"}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
