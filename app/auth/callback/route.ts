import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildSignedInRedirect(origin: string, nextPath: string) {
  const redirectUrl = new URL(nextPath, origin);
  redirectUrl.searchParams.set("signed_in", "1");
  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle();

        if (!profile?.phone) {
          const setupUrl = new URL("/account", requestUrl.origin);
          setupUrl.searchParams.set("setup", "1");
          setupUrl.searchParams.set("next", safeNext);
          return NextResponse.redirect(setupUrl);
        }
      }

      return NextResponse.redirect(buildSignedInRedirect(requestUrl.origin, safeNext));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=auth_callback", requestUrl.origin));
}
