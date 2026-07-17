import { Crown, Trophy, Volleyball } from 'lucide-react';
import { computeStandings, phaseLabel, teamName, formatDate } from '@/data/tournament';
import { useTournament } from '@/data/store';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

function GroupCard({ group, title, accent }: { group: 'A'; title: string; accent: 'orange' | 'cyan' }) {
  const { data } = useTournament();
  const rows = computeStandings(data.teams, data.matches, group);
  const accentText = accent === 'orange' ? 'text-primary' : 'text-cyan-400';
  const accentBar = accent === 'orange' ? 'bg-primary' : 'bg-cyan-400';
  const Icon = Crown;

  return (
    <div className="overflow-hidden rounded-md border border-white/8 bg-[#101010]">
      <div className="relative px-5 py-4">
        <div className={cn('absolute inset-x-0 bottom-0 h-[2px]', accentBar)} />
        <h3 className="flex items-center gap-2.5 font-display text-2xl uppercase tracking-wide text-white">
          <Icon className={cn('h-5 w-5', accentText)} />
          {title}
        </h3>
      </div>
      <ul>
        {rows.map((r, i) => (
          <li
            key={r.team.id}
            className="flex items-center justify-between gap-3 border-t border-white/5 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/5">
                <Volleyball className="h-5 w-5 text-zinc-300" strokeWidth={1.5} />
              </span>
              <span className="font-display text-lg uppercase tracking-wide text-white">{r.team.name}</span>
            </div>
            <div className="text-right text-xs uppercase tracking-widest text-zinc-500">
              <span className={cn('font-display text-lg', accentText)}>{r.points} pt</span>
              <span className="ml-3">{r.won}V · {r.lost}P</span>
              {i < 2 && <span className={cn('ml-3 inline-block h-1.5 w-1.5 rounded-full align-middle', accentBar)} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Gironi() {
  const { data } = useTournament();
  const finals = data.matches.filter((m) => m.phase !== 'gironi');

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Gironi" brush="le squadre in gara" />

      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <GroupCard group="A" title="Girone unico" accent="orange" />
        </div>
      </div>

      {/* cammino verso la finale */}
      <div className="mt-16">
        <div className="mb-6 text-center">
          <h2 className="font-display text-3xl uppercase tracking-wide text-white">
            Il cammino verso la finale
          </h2>
          <p className="font-brush mt-1 text-2xl text-primary">incroci e fasi finali</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {finals.map((m) => (
            <div
              key={m.id}
              className={cn(
                'rounded-md border bg-[#101010] p-5 text-center',
                m.phase === 'finale' ? 'border-primary/50 shadow-[0_0_35px_rgba(255,77,0,0.15)]' : 'border-white/8',
              )}
            >
              {m.phase === 'finale' && <Trophy className="mx-auto mb-2 h-6 w-6 text-primary" />}
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {phaseLabel[m.phase]}
              </p>
              <p className="mt-3 font-display text-base uppercase leading-snug text-white">
                {teamName(data.teams, m, 'home')}
              </p>
              <p className="my-1 font-display text-xs uppercase tracking-[0.3em] text-zinc-600">vs</p>
              <p className="font-display text-base uppercase leading-snug text-white">{teamName(data.teams, m, 'away')}</p>
              <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">
                {formatDate(m.date)} · {m.time}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs uppercase tracking-widest text-zinc-500">
          Passano il turno le prime 4 classificate · 1ª vs 4ª · 2ª vs 3ª
        </p>
      </div>
    </div>
  );
}
