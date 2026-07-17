import { useTournament } from '@/data/store';
import PageHeader from '@/components/PageHeader';

export default function Regolamento() {
  const { data } = useTournament();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Regolamento" brush="poche regole, tanto spettacolo" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.rules.map((r, i) => (
          <div
            key={`${r.title}-${i}`}
            className="rounded-md border border-white/8 bg-[#101010] p-6 transition-colors hover:border-primary/40"
          >
            <span className="font-display text-4xl text-primary/80">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-3 font-display text-xl uppercase tracking-wide text-white">{r.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{r.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-md border border-primary/25 bg-primary/[0.06] p-6 text-center">
        <p className="font-display text-lg uppercase tracking-widest text-primary">Fair play prima di tutto</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-300">
          Il {data.info.name.toLowerCase()} è un torneo di paese: si gioca per divertirsi e stare insieme.
          Le decisioni degli arbitri sono insindacabili, il rispetto tra squadre è la regola numero uno.
        </p>
      </div>
    </div>
  );
}
