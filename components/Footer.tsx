import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#c8ba7e]/15 bg-[#4e5026] text-[#f6f2eb]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-xl font-black">Aunty&apos;s Plants</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#f6f2eb]/75">Homegrown in Tracy.</p>
        </div>
        <div>
          <p className="font-semibold">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-[#f6f2eb]/75">
            <Link href="/plants" className="hover:text-white">
              Plants
            </Link>
            <Link href="/cart" className="hover:text-white">
              Cart
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">Pickup</p>
          <p className="mt-3 text-sm leading-6 text-[#f6f2eb]/75">Local pickup only.</p>
        </div>
      </div>
    </footer>
  );
}
