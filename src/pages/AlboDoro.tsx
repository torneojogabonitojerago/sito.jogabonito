import PageHeader from '@/components/PageHeader';
import { useTournament } from '@/data/store';
import { useTournamentsRegistry } from '@/data/tournaments-registry';
import { isDefined, tournamentYear, type HallOfFameEdition } from '@/data/tournament';

interface EditionView extends HallOfFameEdition {
  tournament: string;
}

export default function AlboDoro() {
  const { data } = useTournament();
  const { tournaments } = useTournamentsRegistry();

  /* edizioni di tutti i tornei (il torneo aperto con i dati più freschi), dalla più recente */
  const sources = [data, ...tournaments.filter((t) => t.slug !== data.slug).map((t) => t.data)];
  const seen = new Set<string>();
  const editions: EditionView[] = [];
  for (const d of sources) {
    for (const e of d.hallOfFame) {
      const key = `${d.info.name}|${e.year}`;
      if (!isDefined(e.winner) || seen.has(key)) continue;
      seen.add(key);
      editions.push({ ...e, tournament: d.info.name });
    }
  }
  editions.sort((a, b) => b.year.localeCompare(a.year));

  const year = tournamentYear(data);
  const showNextEdition = !data.hallOfFame.some((e) => e.year === year && isDefined(e.winner));

  return (
    <div>
      <PageHeader
        title="Albo d'oro"
        brush="chi ha scritto la storia"
        aside={`${editions.length} ${editions.length === 1 ? 'edizione' : 'edizioni'}`}
      />

      <section className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-5 px-4 pb-24 sm:px-6">
        {showNextEdition && (
          <div className="flex min-h-[260px] flex-col justify-center gap-2.5 rounded-[18px] border border-dashed border-primary/40 bg-primary/[0.04] p-8">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Edizione {year}</span>
            <span className="font-display text-[40px] uppercase leading-none text-white">Da definire</span>
            <span className="font-brush text-[28px] text-cyan-400">potresti essere tu</span>
          </div>
        )}

        {editions.map((e) => {
          const rows = [
            ['Finalista', e.runnerUp],
            ['Terzo posto', e.thirdPlace],
            ['MVP', e.mvp],
            ['Capocannoniere', e.topScorer],
          ].filter((x): x is [string, string] => isDefined(x[1]));

          return (
            <div
              key={`${e.tournament}-${e.year}`}
              className="flex flex-col gap-[18px] rounded-[18px] border border-amber-500/[0.35] bg-[linear-gradient(160deg,#100c04,#0a0a0a_65%)] p-8"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[44px] leading-none text-amber-400 [text-shadow:0_0_24px_rgba(245,158,11,0.35)]">
                  {e.year}
                </span>
                <span className="text-right text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  {e.tournament}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">Campione</span>
                <span className="font-display text-[clamp(32px,3.6vw,44px)] uppercase leading-none text-white">
                  {e.winner}
                </span>
              </div>
              {rows.length > 0 && (
                <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 border-t border-white/[0.08] pt-4">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex min-w-0 flex-col gap-0.5">
                      <span className="label-xs">{label}</span>
                      <span className="font-display text-lg uppercase text-zinc-200">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
