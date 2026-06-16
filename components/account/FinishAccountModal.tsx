"use client";

import { useState } from "react";
import { updateProfile } from "@/app/account/actions";

type FinishAccountModalProps = {
  displayName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  nextPath?: string;
};

export function FinishAccountModal({
  displayName,
  phone,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  country,
  nextPath
}: FinishAccountModalProps) {
  const [phoneValue, setPhoneValue] = useState(phone);
  const phoneDigits = phoneValue.replace(/\D/g, "");
  const canCreateAccount = phoneDigits.length === 10;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#49392c]/60 px-4 py-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-[2rem] bg-[#f6f2eb] p-5 shadow-2xl sm:p-7">
        <div className="rounded-[1.5rem] bg-white/75 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#cb6843]">Welcome</p>
          <h2 className="mt-2 text-3xl font-black text-[#4e5026]">Finish creating your account</h2>
          <p className="mt-3 text-sm leading-6 text-[#49392c]/70">
            Add a 10-digit phone number so pickup can be coordinated. You can also update your name and address.
          </p>
        </div>

        <form action={updateProfile} className="mt-5 grid gap-4">
          <input type="hidden" name="nextPath" value={nextPath ?? ""} />
          <label className="grid gap-2">
            <span className="text-sm font-black text-[#4e5026]">Display name</span>
            <input
              name="fullName"
              type="text"
              defaultValue={displayName}
              className="min-h-12 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-base text-[#49392c] outline-none transition focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-[#4e5026]">Phone number required</span>
            <input
              name="phone"
              type="tel"
              required
              value={phoneValue}
              onChange={(event) => setPhoneValue(event.target.value)}
              placeholder="10 digits required"
              minLength={10}
              className="min-h-12 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-base text-[#49392c] outline-none transition placeholder:text-[#49392c]/40 focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
            />
            {!canCreateAccount ? (
              <span className="text-xs font-bold text-red-700">A valid 10-digit phone number is required to continue.</span>
            ) : null}
          </label>

          <div className="grid gap-3 rounded-3xl bg-white/60 p-4">
            <p className="text-sm font-black text-[#4e5026]">Address optional</p>
            <label className="grid gap-1">
              <span className="text-xs font-bold text-[#49392c]/70">Address line 1</span>
              <input name="addressLine1" defaultValue={addressLine1} className="min-h-11 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-sm text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10" />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-bold text-[#49392c]/70">Address line 2</span>
              <input name="addressLine2" defaultValue={addressLine2} className="min-h-11 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-sm text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-[#49392c]/70">City</span>
                <input name="city" defaultValue={city} className="min-h-11 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-sm text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-[#49392c]/70">State/Province/Region</span>
                <input name="state" defaultValue={state} className="min-h-11 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-sm text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-[#49392c]/70">ZIP/Postal code</span>
                <input name="postalCode" defaultValue={postalCode} className="min-h-11 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-sm text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-[#49392c]/70">Country</span>
                <input name="country" defaultValue={country || "United States"} className="min-h-11 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-sm text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10" />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canCreateAccount}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4e5026] px-6 text-sm font-black text-white transition hover:bg-[#49392c] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
