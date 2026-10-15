import { useEffect, useState } from 'react';

interface Props {
  /** inizio torneo (timestamp); null se la data non è ancora definita */
  target: number | null;
}

function remaining(target: number | null, now: number) {
  const ms = target ? Math.max(0, target - now) : 0;
  return {
    ms,
    units: [
      { v: Math.floor(ms / 86_400_000), l: 'Giorni' },
      { v: Math.floor(ms / 3_600_000) % 24, l: 'Ore' },
      { v: Math.floor(ms / 60_000) % 60, l: 'Minuti' },
      { v: Math.floor(ms / 1000) % 60, l: 'Secondi' },
    ],
  };
}

/** Card del countdown nell'hero (modalità pre-torneo). */
export default function CountdownTimer({ target }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = remaining(target, now);
  const date = target ? new Date(target) : null;
  const when = date
    ? `${date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })} · ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
    : 'Data da definire';

  return (
    <div className="relative mt-7 w-full max-w-[500px] overflow-hidden rounded-2xl border border-cyan-400/[0.45] bg-[linear-gradient(135deg,rgba(0,0,0,0.85),rgba(0,20,24,0.85))] shadow-[0_0_80px_rgba(34,211,238,0.15),0_0_40px_rgba(255,0,255,0.1)] backdrop-blur-[10px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400">
          {left.ms > 0 ? 'Si parte tra' : 'Si parte!'}
        </span>
        <span className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{when}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 p-5">
        {left.units.map((u) => (
          <div
            key={u.l}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-1 py-3"
          >
            <span className="font-display text-[clamp(30px,3.4vw,44px)] leading-none tabular-nums text-white [text-shadow:0_0_14px_rgba(255,0,255,0.5)]">
              {String(u.v).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px]">{u.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
