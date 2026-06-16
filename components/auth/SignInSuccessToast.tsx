"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SignInSuccessToast() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signed_in") !== "1") return;

    setIsVisible(true);
    const cleanParams = new URLSearchParams(searchParams.toString());
    cleanParams.delete("signed_in");
    const cleanQuery = cleanParams.toString();
    router.replace(`${pathname}${cleanQuery ? `?${cleanQuery}` : ""}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!isVisible) return;
    const timer = window.setTimeout(() => setIsVisible(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed left-1/2 top-24 z-[120] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-gradient-to-r from-[#dff1dc] via-[#edf7df] to-[#f6f2eb] px-5 py-4 text-center text-sm font-black text-[#1f5a35] shadow-xl shadow-[#1f5a35]/10 ring-1 ring-[#8ebf63]/25">
      Successfully signed in.
    </div>
  );
}
