import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  byDateTime,
  formatDay,
  groupStageDates,
  phaseLabel,
  setsWon,
  teamName,
  type Match,
  type MatchStatus,
  type Team,
} from '@/data/tournament';
import { useTournament } from '@/data/store';
import PageHeader from '@/components/PageHeader';

type StatusFilter = 'all' | MatchStatus;

const statusOpts: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Tutte' },
  { id: 'live', label: 'Live' },
  { id: 'finished', label: 'Giocate' },
  { id: 'scheduled', label: 'Da giocare' },
];

const statusOrder: Record<MatchStatus, number> = { live: 0, finished: 1, scheduled: 2 };

/** Live, poi giocate dalla più recente, poi da giocare dalla più vicina. */
function compareMatches(a: Match, b: Match): number {
  const byStatus = statusOrder[a.status] - statusOrder[b.status];
  if (byStatus) return byStatus;
  return a.status === 'scheduled' ? byDateTime(a, b) : byDateTime(b, a);
}

function ResultCard({ m, teams }: { m: Match; teams: Team[] }) {
  const sw = setsWon(m);
  const done = m.status === 'finished';
  const live = m.status === 'live';
  const chips = m.sets.filter((s) => s.home !== s.away);
  const when = `${m.phase !== 'gironi' ? `${phaseLabel[m.phase]} · ` : ''}${formatDay(m.date)} · ${m.time}`;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[14px] border bg-[#101010]',
        live ? 'border-red-500/50' : 'border-white/[0.06]',
      )}
    >
      <div className="flex items-center justify-between gap-3 bg-white/[0.03] px-[18px] py-2.5 text-[11px] font-bold uppercase tracking-[0.2em]">
        <span
          className={cn('whitespace-nowrap', live ? 'text-red-400' : done ? 'text-cyan-400' : 'text-zinc-400')}
        >
          {live ? '● Live' : done ? 'Finale' : 'Da giocare'}
        </span>
        <span className="text-right text-zinc-500">{when}</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 p-[18px]">
        <span
          className={cn(
            'font-display text-[19px] uppercase leading-[1.1] [text-wrap:balance]',
            done && sw.away > sw.home ? 'text-zinc-500' : 'text-white',
          )}
        >
          {teamName(teams, m, 'home')}
        </span>
        <span
          className={cn(
            'whitespace-nowrap font-display text-[30px] leading-none',
            live ? 'text-red-400' : done ? 'text-white' : 'text-zinc-600',
          )}
        >
          {done || live ? `${sw.home} – ${sw.away}` : 'VS'}
        </span>
        <span
          className={cn(
            'text-right font-display text-[19px] uppercase leading-[1.1] [text-wrap:balance]',
            done && sw.home > sw.away ? 'text-zinc-500' : 'text-white',
          )}
        >
          {teamName(teams, m, 'away')}
        </span>
      </div>
      <div className="flex min-h-[26px] justify-center gap-2 px-[18px] pb-4">
        {chips.map((s, i) => (
          <span key={i} className="rounded-md bg-white/5 px-2.5 py-1 text-[13px] font-bold tracking-[0.04em] text-zinc-300">
            {s.home}–{s.away}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Risultati() {
  const { data } = useTournament();
  const { teams, matches } = data;
  const [status, setStatus] = useState<StatusFilter>('all');
  const [team, setTeam] = useState('all');
  const [day, setDay] = useState('all');

  const dates = groupStageDates(matches);
  const hasFinals = matches.some((m) => m.phase !== 'gironi');
  const dayFilters = [
    { id: 'all', label: 'Tutte' },
    ...dates.map((d, i) => ({ id: d, label: `Giornata ${i + 1}` })),
    ...(hasFinals ? [{ id: 'finali', label: 'Fasi finali' }] : []),
  ];

  const list = useMemo(
    () =>
      matches
        .filter((m) => status === 'all' || m.status === status)
        .filter((m) => team === 'all' || m.home === team || m.away === team)
        .filter((m) =>
          day === 'all' ? true : day === 'finali' ? m.phase !== 'gironi' : m.phase === 'gironi' && m.date === day,
        )
        .sort(compareMatches),
    [matches, status, team, day],
  );

  const played = matches.filter((m) => m.status === 'finished').length;

  return (
    <div>
      <PageHeader title="Risultati" brush="punto su punto" aside={`${played} partite giocate`} />

      <section className="mx-auto flex max-w-[1080px] flex-col gap-6 px-4 pb-24 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-full border border-white/[0.08] bg-[#0a0a0a] p-1">
            {statusOpts.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setStatus(o.id)}
                className={cn(
                  'whitespace-nowrap rounded-full px-[13px] py-[7px] text-xs font-bold uppercase tracking-[0.12em] transition-colors',
                  status === o.id ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            aria-label="Filtra per squadra"
            className="min-w-[220px] rounded-[10px] border border-white/[0.12] bg-[#0a0a0a] px-3 py-2.5 font-display text-sm uppercase tracking-[0.04em] text-white outline-none [color-scheme:dark] focus:border-primary"
          >
            <option value="all">Tutte le squadre</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {dayFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setDay(f.id)}
              className={cn(
                'whitespace-nowrap rounded-full border px-[18px] py-2.5 font-display text-sm uppercase tracking-[0.12em] transition-colors',
                day === f.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-white/15 text-zinc-400 hover:border-primary/50 hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-white/[0.12] p-10 text-center text-base text-zinc-400">
            Nessuna partita con questi filtri.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-3.5">
            {list.map((m) => (
              <ResultCard key={m.id} m={m} teams={teams} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
