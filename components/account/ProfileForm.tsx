"use client";

import { useMemo, useState } from "react";
import { updateProfile } from "@/app/account/actions";

type ProfileFormProps = {
  displayName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function ProfileForm({
  displayName,
  phone,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  country
}: ProfileFormProps) {
  const initialValues = useMemo(
    () => ({
      fullName: displayName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country
    }),
    [addressLine1, addressLine2, city, country, displayName, phone, postalCode, state]
  );
  const [values, setValues] = useState(initialValues);
  const phoneDigits = values.phone.replace(/\D/g, "");
  const hasChanges = Object.entries(values).some(([key, value]) => value !== initialValues[key as keyof typeof initialValues]);
  const canSave = hasChanges && phoneDigits.length === 10;

  function updateField(name: keyof typeof values, value: string) {
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  return (
    <form action={updateProfile} className="mt-6 grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm font-black text-green-950">Display name</span>
        <input
          name="fullName"
          type="text"
          value={values.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className="min-h-12 rounded-2xl border border-green-900/15 bg-[#fbf7ef] px-4 text-base text-green-950 outline-none transition focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-black text-green-950">Phone number</span>
        <input
          name="phone"
          type="tel"
          required
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          placeholder="10 digits required"
          minLength={10}
          className="min-h-12 rounded-2xl border border-green-900/15 bg-[#fbf7ef] px-4 text-base text-green-950 outline-none transition placeholder:text-green-950/40 focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
        />
        <span className="text-xs font-bold text-green-950/55">A valid 10-digit phone number is required before your account can be saved.</span>
      </label>
      <div className="grid gap-3 rounded-3xl bg-[#fbf7ef] p-4">
        <p className="text-sm font-black text-green-950">Address optional</p>
        {[
          ["addressLine1", "Address line 1"],
          ["addressLine2", "Address line 2"],
          ["city", "City"],
          ["state", "State/Province/Region"],
          ["postalCode", "ZIP/Postal code"],
          ["country", "Country"]
        ].map(([name, label]) => (
          <label key={name} className="grid gap-1">
            <span className="text-xs font-bold text-green-950/65">{label}</span>
            <input
              name={name}
              value={values[name as keyof typeof values]}
              onChange={(event) => updateField(name as keyof typeof values, event.target.value)}
              className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={!canSave}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
      >
        Save profile
      </button>
    </form>
  );
}
