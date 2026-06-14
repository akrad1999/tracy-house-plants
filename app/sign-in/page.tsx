import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { PageHero } from "@/components/PageHero";

type SignInPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Tracy House Plants account."
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Sign in"
        title="Access your plant account"
        description="Use Google to view order history, pickup details, and saved account information."
      />
      <section className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <div className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-black text-green-950">Welcome back</h1>
          <p className="mt-3 text-sm leading-6 text-green-950/65">
            Sign in securely with Google. No password is stored by Tracy House Plants.
          </p>
          <div className="mt-6">
            <GoogleSignInButton next={next ?? "/account"} />
          </div>
        </div>
      </section>
    </>
  );
}
