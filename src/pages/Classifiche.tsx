import { computeStandings } from '@/data/tournament';
import { useTournament } from '@/data/store';
import StandingsTable from '@/components/StandingsTable';
import PageHeader from '@/components/PageHeader';

/* con il girone unico passano in semifinale le prime 4 */
const QUALIFY_SPOTS = 4;

export default function Classifiche() {
  const { data } = useTournament();
  const rows = computeStandings(data.teams, data.matches);
  // prima della prima partita la classifica è solo alfabetica: niente qualificate
  const started = rows.some((r) => r.played > 0);

  return (
    <div>
      <PageHeader title="Classifica" brush="chi comanda il girone" aside="Aggiornata in tempo reale" />

      <section className="mx-auto flex max-w-[1080px] flex-col gap-4 px-4 pb-24 sm:px-6">
        <StandingsTable rows={rows} qualifySpots={started ? QUALIFY_SPOTS : 0} />

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
