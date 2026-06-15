import type { Metadata } from "next";
import { GoogleSignInButton, YahooSignInButton } from "@/components/GoogleSignInButton";
import { ManualAuthForms } from "@/components/ManualAuthForms";
import { PageHero } from "@/components/PageHero";

type SignInPageProps = {
  searchParams: Promise<{ next?: string; error?: string; message?: string }>;
};

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Tracy House Plants account."
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next, error, message } = await searchParams;
  const nextPath = next ?? "/account";

  return (
    <>
      <PageHero
        eyebrow="Sign in"
        title="Access your plant account"
        description="Use Google or Yahoo to view order history, pickup details, and saved account information."
      />
      <section className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <div className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-black text-green-950">Welcome back</h1>
          <p className="mt-3 text-sm leading-6 text-green-950/65">
            Sign in securely with your preferred account. No password is stored by Tracy House Plants.
          </p>
          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{error}</p>
          ) : null}
          {message ? (
            <p className="mt-4 rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-950">{message}</p>
          ) : null}
          <div className="mt-6 grid gap-3">
            <GoogleSignInButton next={nextPath} />
            <YahooSignInButton next={nextPath} />
          </div>
          <ManualAuthForms nextPath={nextPath} />
        </div>
      </section>
    </>
  );
}
