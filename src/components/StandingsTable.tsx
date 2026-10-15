import { cn } from '@/lib/utils';
import type { StandingRow } from '@/data/tournament';

interface Props {
  rows: StandingRow[];
  /** prime N posizioni evidenziate come qualificate */
  qualifySpots?: number;
}

const cols = 'grid grid-cols-[64px_minmax(0,1fr)_56px_48px_48px_48px_64px_64px]';

const posColor = (pos: number) =>
  pos === 1 ? 'text-amber-400' : pos === 2 ? 'text-zinc-200' : pos === 3 ? 'text-amber-600' : 'text-zinc-500';

export default function StandingsTable({ rows, qualifySpots = 0 }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101010]">
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <div className="min-w-[640px]">
          <div
            className={cn(
              cols,
              'border-b-2 border-primary px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500',
            )}
          >
            <span>Pos</span>
            <span>Squadra</span>
            <span className="text-center">Pt</span>
            <span className="text-center">PG</span>
            <span className="text-center">V</span>
            <span className="text-center">P</span>
            <span className="text-center">Set</span>
            <span className="text-center">Diff</span>
          </div>

          {rows.length === 0 && <p className="px-6 py-5 text-sm text-zinc-500">Nessuna squadra in classifica.</p>}

          {rows.map((r, i) => {
            const pos = i + 1;
            const qualified = pos <= qualifySpots;
            const lastQualified = pos === qualifySpots && rows.length > qualifySpots;
            return (
              <div
                key={r.team.id}
                className={cn(
                  cols,
                  'items-center border-t border-white/5 px-6 py-[15px]',
                  qualified && 'bg-primary/5',
                  lastQualified && 'shadow-[inset_0_-2px_0_rgba(255,0,255,0.45)]',
                )}
              >
                <span className={cn('flex items-center gap-2 font-display text-xl', posColor(pos))}>
                  {pos}
                  {qualified && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </span>
                <span className="truncate font-display text-xl uppercase text-white">{r.team.name}</span>
                <span className="text-center font-display text-[22px] text-primary">{r.points}</span>
                <span className="text-center text-base text-zinc-300">{r.played}</span>
                <span className="text-center text-base text-zinc-300">{r.won}</span>
                <span className="text-center text-base text-zinc-300">{r.lost}</span>
                <span className="text-center text-base text-zinc-300">
                  {r.setsFor}-{r.setsAgainst}
                </span>
                <span
                  className={cn(
                    'text-center text-base font-bold',
                    r.setDiff > 0 ? 'text-green-500' : r.setDiff < 0 ? 'text-red-500' : 'text-zinc-500',
                  )}
                >
                  {r.setDiff > 0 ? `+${r.setDiff}` : r.setDiff}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
