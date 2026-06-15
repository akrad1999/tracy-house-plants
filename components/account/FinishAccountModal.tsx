"use client";

import { useState } from "react";
import { updateProfile } from "@/app/account/actions";

type FinishAccountModalProps = {
  displayName: string;
  phone: string;
  address: string;
  nextPath?: string;
};

export function FinishAccountModal({ displayName, phone, address, nextPath }: FinishAccountModalProps) {
  const [phoneValue, setPhoneValue] = useState(phone);
  const canCreateAccount = phoneValue.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#49392c]/60 px-4 py-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-[2rem] bg-[#f6f2eb] p-5 shadow-2xl sm:p-7">
        <div className="rounded-[1.5rem] bg-white/75 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#cb6843]">Welcome</p>
          <h2 className="mt-2 text-3xl font-black text-[#4e5026]">Finish creating your account</h2>
          <p className="mt-3 text-sm leading-6 text-[#49392c]/70">
            Add a phone number so pickup can be coordinated. You can also update your name, address, and profile photo.
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
              placeholder="Required to continue"
              className="min-h-12 rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 text-base text-[#49392c] outline-none transition placeholder:text-[#49392c]/40 focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
            />
            {!canCreateAccount ? (
              <span className="text-xs font-bold text-red-700">Phone number is required to continue.</span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-[#4e5026]">Address optional</span>
            <textarea
              name="address"
              defaultValue={address}
              rows={3}
              placeholder="Optional pickup/contact address"
              className="rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 py-3 text-base text-[#49392c] outline-none transition placeholder:text-[#49392c]/40 focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-[#4e5026]">Profile picture optional</span>
            <input
              name="avatarFile"
              type="file"
              accept="image/*"
              className="rounded-2xl border border-[#c8ba7e]/45 bg-white px-4 py-3 text-sm text-[#49392c] file:mr-4 file:rounded-full file:border-0 file:bg-[#4e5026] file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
            />
            <span className="text-xs text-[#49392c]/55">JPG, PNG, WebP, or GIF under 5MB.</span>
          </label>

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
