type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="bg-[radial-gradient(circle_at_top_left,_#d8ead3,_transparent_34%),linear-gradient(135deg,_#fbf7ef,_#eef6e8)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-green-800">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-green-950 sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-green-950/70 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
