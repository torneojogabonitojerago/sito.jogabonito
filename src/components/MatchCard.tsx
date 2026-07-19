import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, setsWon, teamName, type Match, type Team } from '@/data/tournament';

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'finished')
    return (
      <span className="rounded-sm bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
        Terminata
      </span>
    );
  if (status === 'live')
    return (
      <span className="flex items-center gap-1.5 rounded-sm bg-primary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-white">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        Live
      </span>
    );
  return (
    <span className="rounded-sm bg-white/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
      Da giocare
    </span>
  );
}

function TeamRow({ name, score, winner }: { name: string; score: number | null; winner: boolean }) {
  const played = score !== null;
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={cn(
          'font-display text-base uppercase tracking-wide sm:text-lg',
          winner ? 'text-white' : 'text-zinc-400',
          !played && 'text-zinc-300',
        )}
      >
        {name}
      </span>
      {played && (
        <span
          className={cn(
            'font-display text-2xl leading-none sm:text-3xl',
            winner ? 'text-primary' : 'text-zinc-500',
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export default function MatchCard({ match, teams }: { match: Match; teams: Team[] }) {
  const played = match.status !== 'scheduled' && match.sets.length > 0;
  const sw = setsWon(match);
  const homeWon = played && sw.home > sw.away;
  const awayWon = played && sw.away > sw.home;

  return (
    <div className="group rounded-md border border-white/8 bg-[#101010] p-4 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,0,255,0.15)] sm:p-5">
      {/* data e ora */}
      <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-primary/90">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(match.date)}
        </span>
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
          {match.time}
        </span>
      </div>

      {/* squadre e punteggio */}
      <div className="space-y-2.5">
        <TeamRow
          name={teamName(teams, match, 'home')}
          score={played ? sw.home : null}
          winner={homeWon}
        />
        <TeamRow
          name={teamName(teams, match, 'away')}
          score={played ? sw.away : null}
          winner={awayWon}
        />
      </div>

      {/* footer card */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <StatusBadge status={match.status} />
        {played ? (
          <span className="text-xs font-medium tracking-wider text-zinc-500">
            {match.sets.map((s) => `${s.home}-${s.away}`).join(' · ')}
          </span>
        ) : (
          <span className="font-display text-xs uppercase tracking-[0.25em] text-zinc-600">vs</span>
        )}
      </div>
    </div>
  );
}
