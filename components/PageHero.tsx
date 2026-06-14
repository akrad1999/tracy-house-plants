type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#6f7d2d]">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-[#31551f] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#4d3d24]/70 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
