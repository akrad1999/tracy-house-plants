import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-green-900/10 bg-green-950 text-green-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-xl font-black">Tracy House Plants</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-green-50/75">
            Small-batch houseplants for neighbors who want healthy, pickup-ready greenery.
          </p>
        </div>
        <div>
          <p className="font-semibold">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-green-50/75">
            <Link href="/plants" className="hover:text-white">
              Plant catalog
            </Link>
            <Link href="/account" className="hover:text-white">
              Account
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">Pickup</p>
          <p className="mt-3 text-sm leading-6 text-green-50/75">
            Checkout is local pickup only. Delivery is outside the current MVP.
          </p>
        </div>
      </div>
    </footer>
  );
}
