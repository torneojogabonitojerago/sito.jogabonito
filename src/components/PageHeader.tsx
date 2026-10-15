interface Props {
  title: string;
  brush: string;
  /** nota a destra, es. "8 partite giocate" */
  aside?: string;
}

export default function PageHeader({ title, brush, aside }: Props) {
  return (
    <section className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-5 px-4 pb-9 pt-12 sm:px-6 sm:pt-16">
      <div className="min-w-0">
        <h1 className="font-display text-glow break-words text-[clamp(52px,8vw,112px)] uppercase leading-none text-white">
          {title}
        </h1>
        <p className="font-brush brush-glow mt-6 origin-left -rotate-[1.5deg] text-[clamp(30px,3.4vw,42px)] font-bold leading-none text-primary sm:mt-8">
          {brush}
        </p>
      </div>
      {aside && <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">{aside}</span>}
    </section>
  );
}
