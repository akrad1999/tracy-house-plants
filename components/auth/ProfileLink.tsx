"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

type ProfileLinkProps = {
  isSignedIn: boolean;
  isAdmin?: boolean;
  label: string;
  className: string;
  children: ReactNode;
};

export function ProfileLink({ isSignedIn, isAdmin = false, label, className, children }: ProfileLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const currentPath = `${pathname}${queryString ? `?${queryString}` : ""}`;

  useEffect(() => {
    if (!isOpen) return;

    const closeTimer = window.setTimeout(() => setIsOpen(false), 3000);

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.clearTimeout(closeTimer);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  if (isSignedIn) {
    return (
      <div ref={menuRef} className="relative">
        <button type="button" aria-label={label} onClick={() => setIsOpen((open) => !open)} className={className}>
          {children}
        </button>
        {isOpen ? (
          <div className="absolute right-0 top-12 z-[80] min-w-36 overflow-hidden rounded-2xl border border-[#c8ba7e]/25 bg-white shadow-xl shadow-[#49392c]/10">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm font-black text-[#4e5026] transition hover:bg-[#f6f2eb]"
            >
              Profile
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="block border-t border-[#c8ba7e]/15 px-4 py-3 text-sm font-black text-[#4e5026] transition hover:bg-[#f6f2eb]"
            >
              Orders
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block border-t border-[#c8ba7e]/15 px-4 py-3 text-sm font-black text-[#4e5026] transition hover:bg-[#f6f2eb]"
              >
                Admin
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  const href = `/sign-in?next=${encodeURIComponent(currentPath)}`;

  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}
