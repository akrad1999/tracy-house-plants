import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { CartLink } from "@/components/cart/CartLink";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/plants", label: "Plants" },
  { href: "/account", label: "Account" }
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
    <header className="sticky top-0 z-50 border-b border-green-900/10 bg-[#fbf7ef]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-green-900 text-lg font-black text-white">
            T
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-green-950">Tracy House Plants</span>
            <span className="block text-xs font-medium uppercase tracking-[0.25em] text-green-800/70">Local pickup</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-green-950 transition hover:bg-green-900 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <CartLink />
          <Link
            href={user ? "/account" : "/sign-in?next=/account"}
            className="inline-flex min-h-11 items-center gap-3 rounded-full border border-green-900/15 bg-white px-3 py-2 text-sm font-black text-green-950 shadow-sm transition hover:border-green-900/40"
          >
            {user && avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-8 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-green-100 text-xs text-green-950">
                {user ? displayName.charAt(0).toUpperCase() : "?"}
              </span>
            )}
            <span>{user ? displayName : "Log In"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
