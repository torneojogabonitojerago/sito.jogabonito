import { useTournament } from '@/data/store';
import PageHeader from '@/components/PageHeader';

export default function Regolamento() {
  const { data } = useTournament();

  return (
    <div>
      <PageHeader title="Regolamento" brush="poche regole, tanto spettacolo" aside={data.sport} />

      <section className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 pb-24 sm:px-6">
        {data.rules.length > 0 && (
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]">
            {data.rules.map((r, i) => (
              <div
                key={`${r.title}-${i}`}
                className="flex flex-col gap-2.5 bg-[#0c0c0c] p-7 transition-colors hover:bg-[#121012]"
              >
                <span className="font-display text-[40px] leading-none text-primary opacity-85">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-[22px] uppercase text-white">{r.title}</span>
                <span className="text-base leading-normal text-zinc-400 [text-wrap:pretty]">{r.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/[0.06] p-7 text-center">
          <span className="font-display text-xl uppercase tracking-[0.14em] text-primary">Fair play prima di tutto</span>
          <span className="max-w-[62ch] text-base leading-normal text-zinc-300 [text-wrap:pretty]">
            È un torneo di paese: si gioca per divertirsi e stare insieme. Le decisioni degli arbitri sono insindacabili,
            il rispetto tra squadre è la regola numero uno.
          </span>
        </div>
      </section>
    </div>
  );
}
