import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#c8ba7e]/15 bg-[#4e5026] text-[#f6f2eb]">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-black">Aunty&apos;s Plants</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-[#f6f2eb]/75">Homegrown in Tracy.</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Shop</p>
          <div className="mt-1 flex gap-3 text-xs text-[#f6f2eb]/75 md:grid md:gap-1">
            <Link href="/plants" className="hover:text-white">
              Plants
            </Link>
            <Link href="/cart" className="hover:text-white">
              Cart
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Pickup</p>
          <p className="mt-1 text-xs leading-5 text-[#f6f2eb]/75">Local pickup only.</p>
        </div>
      </div>
    </footer>
  );
}
