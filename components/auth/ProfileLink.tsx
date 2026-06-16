"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type ProfileLinkProps = {
  isSignedIn: boolean;
  label: string;
  className: string;
  children: ReactNode;
};

export function ProfileLink({ isSignedIn, label, className, children }: ProfileLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const currentPath = `${pathname}${queryString ? `?${queryString}` : ""}`;
  const href = isSignedIn ? "/account" : `/sign-in?next=${encodeURIComponent(currentPath)}`;

  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}
