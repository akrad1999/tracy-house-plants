"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type GoogleSignInButtonProps = {
  next?: string;
};

export function GoogleSignInButton({ next = "/account" }: GoogleSignInButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
      }
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to start Google sign in.");
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Opening Google..." : "Continue with Google"}
      </button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
