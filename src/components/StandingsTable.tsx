import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StandingRow } from '@/data/tournament';

interface Props {
  title: string;
  icon: LucideIcon;
  rows: StandingRow[];
  accent?: 'orange' | 'cyan';
  general?: boolean;
  qualifySpots?: number; // prime N posizioni evidenziate come qualificate
}

const posColor = (pos: number) =>
  pos === 1 ? 'text-amber-400' : pos === 2 ? 'text-zinc-200' : pos === 3 ? 'text-amber-700' : 'text-zinc-500';

export default function StandingsTable({ title, icon: Icon, rows, accent = 'orange', general = false, qualifySpots = 0 }: Props) {
  const accentText = accent === 'orange' ? 'text-primary' : 'text-cyan-400';
  const accentBar = accent === 'orange' ? 'bg-primary' : 'bg-cyan-400';

  return (
    <div className="overflow-hidden rounded-md border border-white/8 bg-[#101010]">
      {/* intestazione */}
      <div className="relative px-5 py-4">
        <div className={cn('absolute inset-x-0 bottom-0 h-[2px]', accentBar)} />
        <h3 className="flex items-center gap-2.5 font-display text-xl uppercase tracking-wide text-white">
          <Icon className={cn('h-5 w-5', accentText)} />
          {title}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3 font-semibold">Pos</th>
              <th className="py-3 pr-2 font-semibold">Squadra</th>
              <th className="py-3 text-center font-semibold">Pt</th>
              <th className="py-3 text-center font-semibold">PG</th>
              <th className="py-3 text-center font-semibold">V</th>
              <th className="py-3 text-center font-semibold">P</th>
              <th className="py-3 text-center font-semibold">SV</th>
              <th className="py-3 text-center font-semibold">SP</th>
              <th className="py-3 text-center font-semibold">Diff</th>
              {general && (
                <>
                  <th className="py-3 text-center font-semibold">PF</th>
                  <th className="py-3 pr-5 text-center font-semibold">PS</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const pos = i + 1;
              const qualified = qualifySpots > 0 && pos <= qualifySpots;
              return (
                <tr
                  key={r.team.id}
                  className={cn(
                    'border-t border-white/5',
                    qualified && 'bg-primary/[0.06]',
                    r.played === 0 && 'opacity-70',
                  )}
                >
                  <td className={cn('px-5 py-3.5 font-display text-base', posColor(pos))}>
                    <span className="flex items-center gap-2">
                      {pos}
                      {qualified && <span className={cn('h-1.5 w-1.5 rounded-full', accentBar)} />}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2">
                    <span className="font-display text-base uppercase tracking-wide text-white">
                      {r.team.name}
                    </span>
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                      Gr. {r.team.group}
                    </span>
                  </td>
                  <td className={cn('py-3.5 text-center font-display text-base', accentText)}>{r.points}</td>
                  <td className="py-3.5 text-center text-zinc-300">{r.played}</td>
                  <td className="py-3.5 text-center text-zinc-300">{r.won}</td>
                  <td className="py-3.5 text-center text-zinc-300">{r.lost}</td>
                  <td className="py-3.5 text-center text-zinc-300">{r.setsFor}</td>
                  <td className="py-3.5 text-center text-zinc-300">{r.setsAgainst}</td>
                  <td
                    className={cn(
                      'py-3.5 text-center font-semibold',
                      r.setDiff > 0 ? 'text-green-500' : r.setDiff < 0 ? 'text-red-500' : 'text-zinc-500',
                    )}
                  >
                    {r.setDiff > 0 ? `+${r.setDiff}` : r.setDiff}
                  </td>
                  {general && (
                    <>
                      <td className="py-3.5 text-center text-zinc-400">
                        {r.pointsFor}
                        {r.played > 0 && (
                          <span className="ml-1 text-xs text-zinc-600">({(r.pointsFor / r.played).toFixed(1)})</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-5 text-center text-zinc-400">
                        {r.pointsAgainst}
                        {r.played > 0 && (
                          <span className="ml-1 text-xs text-zinc-600">({(r.pointsAgainst / r.played).toFixed(1)})</span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
