import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-green-800">Not found</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-green-950 sm:text-5xl">
        This plant is not in the catalog.
      </h1>
      <p className="mt-5 text-base leading-7 text-green-950/65">
        It may have been sold, renamed, or moved out of the current catalog.
      </p>
      <Link
        href="/plants"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800"
      >
        Browse plants
      </Link>
    </section>
  );
}
