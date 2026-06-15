"use client";

import { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/app/sign-in/actions";

type ManualAuthFormsProps = {
  nextPath: string;
};

export function ManualAuthForms({ nextPath }: ManualAuthFormsProps) {
  const [phone, setPhone] = useState("");
  const phoneDigits = phone.replace(/\D/g, "");
  const canCreateAccount = phoneDigits.length === 10;

  return (
    <div className="mt-8 grid gap-5 border-t border-green-900/10 pt-6">
      <details className="rounded-3xl bg-[#fbf7ef] p-4" open>
        <summary className="cursor-pointer text-sm font-black text-green-950">Sign in with email</summary>
        <form action={signInWithPassword} className="mt-4 grid gap-3">
          <input type="hidden" name="nextPath" value={nextPath} />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
          />
          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-green-950 px-5 text-sm font-black text-white transition hover:bg-green-800">
            Sign in
          </button>
        </form>
      </details>

      <details className="rounded-3xl bg-[#fbf7ef] p-4">
        <summary className="cursor-pointer text-sm font-black text-green-950">Create account with email</summary>
        <form action={signUpWithPassword} className="mt-4 grid gap-3">
          <input type="hidden" name="nextPath" value={nextPath} />
          <input name="fullName" type="text" placeholder="Display name" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
          <input name="email" type="email" required placeholder="Email" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
          <input name="password" type="password" required minLength={6} placeholder="Password" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
          <label className="grid gap-1">
            <span className="text-xs font-bold text-green-950/65">Phone number required</span>
            <input
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="10 digits required"
              className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
            />
            {!canCreateAccount ? <span className="text-xs font-bold text-red-700">A valid 10-digit phone number is required.</span> : null}
          </label>

          <div className="grid gap-3 rounded-3xl bg-white/65 p-4">
            <p className="text-sm font-black text-green-950">Address optional</p>
            <input name="addressLine1" placeholder="Address line 1" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
            <input name="addressLine2" placeholder="Address line 2" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="city" placeholder="City" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
              <input name="state" placeholder="State/Province/Region" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="postalCode" placeholder="ZIP/Postal code" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
              <input name="country" defaultValue="United States" placeholder="Country" className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canCreateAccount}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-green-950 px-5 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Create account
          </button>
        </form>
      </details>
    </div>
  );
}
