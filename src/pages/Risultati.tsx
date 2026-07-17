import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { phaseLabel, type Match, type MatchPhase, type Team } from '@/data/tournament';
import { useTournament } from '@/data/store';
import MatchCard from '@/components/MatchCard';
import PageHeader from '@/components/PageHeader';

type Filter = 'all' | 'finali';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tutti i risultati' },
  { id: 'finali', label: 'Fasi finali' },
];

function MatchGroup({ title, list, teams }: { title: string; list: Match[]; teams: Team[] }) {
  if (list.length === 0) return null;
  return (
    <section className="mb-12">
      <div className="mb-5 border-b-2 border-primary/60 pb-2">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <MatchCard key={m.id} match={m} teams={teams} />
        ))}
      </div>
    </section>
  );
}

export default function Risultati() {
  const [filter, setFilter] = useState<Filter>('all');
  const { data } = useTournament();

  const sorted = useMemo(
    () => [...data.matches].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [data.matches],
  );

  const byPhase = (p: MatchPhase) => sorted.filter((m) => m.phase === p);
  const byGironi = () => sorted.filter((m) => m.phase === 'gironi');
  
  // Group matches by date
  const groupByDate = (matches: Match[]) => {
    const groups: Record<string, Match[]> = {};
    matches.forEach(m => {
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    });
    return groups;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Punteggi" brush="tutti i risultati" />

      {/* filtri */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-sm px-4 py-2 font-display text-sm uppercase tracking-widest transition-colors',
              filter === f.id
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,77,0,0.4)]'
                : 'border border-white/10 bg-[#101010] text-zinc-400 hover:border-primary/50 hover:text-white',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === 'all' && (
        <>
          {/* Partite di girone organizzate per data */}
          {Object.entries(groupByDate(byGironi())).map(([date, matches]) => (
            <section key={date} className="mb-12">
              <div className="mb-5 border-b-2 border-primary/60 pb-2">
                <h2 className="font-display text-2xl uppercase tracking-wide text-white">
                  {new Date(date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => (
                  <MatchCard key={m.id} match={m} teams={data.teams} />
                ))}
              </div>
            </section>
          ))}
          
          {/* Fasi finali */}
          <MatchGroup title={phaseLabel.semifinale} list={byPhase('semifinale')} teams={data.teams} />
          <MatchGroup title={phaseLabel.finalina} list={byPhase('finalina')} teams={data.teams} />
          <MatchGroup title={phaseLabel.finale} list={byPhase('finale')} teams={data.teams} />
        </>
      )}
      
      {filter === 'finali' && (
        <>
          <MatchGroup title={phaseLabel.semifinale} list={byPhase('semifinale')} teams={data.teams} />
          <MatchGroup title={phaseLabel.finalina} list={byPhase('finalina')} teams={data.teams} />
          <MatchGroup title={phaseLabel.finale} list={byPhase('finale')} teams={data.teams} />
        </>
      )}
    </div>
  );
}
