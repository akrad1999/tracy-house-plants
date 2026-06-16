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

    const timer = window.setTimeout(() => setIsVisible(false), 3500);
    return () => window.clearTimeout(timer);
  }, [pathname, router, searchParams]);

  if (!isVisible) return null;

  return (
    <div className="fixed left-1/2 top-24 z-[120] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-gradient-to-r from-[#1f5a35] via-[#4e7d3a] to-[#8ebf63] px-5 py-4 text-center text-sm font-black text-white shadow-2xl shadow-[#1f5a35]/25">
      Successfully signed in.
    </div>
  );
}
