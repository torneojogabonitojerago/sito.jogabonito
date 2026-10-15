import { groupLabel, groupStandings, qualifiersPerGroup } from '@/data/tournament';
import { useTournament } from '@/data/store';
import StandingsTable from '@/components/StandingsTable';
import PageHeader from '@/components/PageHeader';

export default function Classifiche() {
  const { data } = useTournament();
  const tables = groupStandings(data);
  const multi = tables.length > 1;
  // prima della prima partita la classifica è solo alfabetica: niente qualificate
  const started = tables.some((t) => t.rows.some((r) => r.played > 0));
  const qualify = started ? qualifiersPerGroup(data.groupCount) : 0;

  return (
    <div>
      <PageHeader
        title="Classifica"
        brush={multi ? 'chi comanda i gironi' : 'chi comanda il girone'}
        aside="Aggiornata in tempo reale"
      />

      <section className="mx-auto flex max-w-[1080px] flex-col gap-4 px-4 pb-24 sm:px-6">
        {tables.map((t) => (
          <div key={t.group} className="flex flex-col gap-3">
            {multi && <span className="font-display text-[28px] uppercase text-white">{groupLabel(data, t.group)}</span>}
            <StandingsTable rows={t.rows} qualifySpots={qualify} />
          </div>
        ))}

        <div className="flex flex-wrap gap-x-7 gap-y-2 text-[13px] font-semibold text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Qualificate in semifinale
          </span>
          <span>Vittoria 3 punti · a parità: differenza set, poi differenza punti</span>
        </div>
      </section>
    </div>
  );
}
