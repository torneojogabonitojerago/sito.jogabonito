import { Trophy } from 'lucide-react';
import { computeStandings } from '@/data/tournament';
import { useTournament } from '@/data/store';
import StandingsTable from '@/components/StandingsTable';
import PageHeader from '@/components/PageHeader';

export default function Classifiche() {
  const { data } = useTournament();
  const generale = computeStandings(data.teams, data.matches);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Classifiche" brush="classifiche ufficiali" />

      <div className="mt-10">
        <StandingsTable title="Classifica Generale" icon={Trophy} rows={generale} accent="orange" general />
      </div>

      <div className="mt-6 grid gap-3 text-xs text-zinc-500 sm:grid-cols-3">
        <p><span className="font-bold text-zinc-300">PT</span> punti (vittoria = 3)</p>
        <p><span className="font-bold text-zinc-300">PG/V/P</span> partite giocate, vinte, perse</p>
        <p>
          <span className="font-bold text-zinc-300">SV/SP/DIFF</span> set vinti, set persi, differenza set ·{' '}
          <span className="font-bold text-zinc-300">PF/PS</span> punti fatti/subiti (media a partita)
        </p>
      </div>
    </div>
  );
}
