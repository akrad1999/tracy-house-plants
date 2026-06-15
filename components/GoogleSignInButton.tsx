"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type OAuthSignInButtonProps = {
  provider: "google" | "custom:yahoo";
  label: string;
  loadingLabel: string;
  errorLabel: string;
  next?: string;
  className?: string;
};

function OAuthSignInButton({
  provider,
  label,
  loadingLabel,
  errorLabel,
  next = "/account",
  className = "bg-green-950 text-white hover:bg-green-800"
}: OAuthSignInButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithProvider() {
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
      }
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : errorLabel);
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signInWithProvider}
        disabled={isLoading}
        className={`inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      >
        {isLoading ? loadingLabel : label}
      </button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}

export function GoogleSignInButton({ next = "/account" }: Pick<OAuthSignInButtonProps, "next">) {
  return (
    <OAuthSignInButton
      provider="google"
      label="Continue with Google"
      loadingLabel="Opening Google..."
      errorLabel="Unable to start Google sign in."
      next={next}
    />
  );
}

export function YahooSignInButton({ next = "/account" }: Pick<OAuthSignInButtonProps, "next">) {
  return (
    <OAuthSignInButton
      provider="custom:yahoo"
      label="Continue with Yahoo"
      loadingLabel="Opening Yahoo..."
      errorLabel="Unable to start Yahoo sign in."
      next={next}
      className="bg-[#6001d2] text-white hover:bg-[#4f01ad]"
    />
  );
}
