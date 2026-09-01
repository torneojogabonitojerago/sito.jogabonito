import { useEffect, useState } from 'react';

interface Props {
  target: string; // ISO date-time
}

function diff(target: string) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

const units: { key: keyof ReturnType<typeof diff>; label: string }[] = [
  { key: 'days', label: 'Giorni' },
  { key: 'hours', label: 'Ore' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
];

export default function CountdownTimer({ target }: Props) {
  const [remaining, setRemaining] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="mx-auto flex max-w-md justify-center gap-3 sm:gap-4">
      {units.map((u) => (
        <div
          key={u.key}
          className="flex-1 rounded-lg border border-primary/30 bg-gradient-to-br from-[#101010] to-[#0a0a0a] px-2 py-4 text-center shadow-[0_0_25px_rgba(255,0,255,0.12)]"
        >
          <p className="font-display text-3xl text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.5)] sm:text-4xl">
            {String(remaining[u.key]).padStart(2, '0')}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{u.label}</p>
        </div>
      ))}
    </div>
  );
}
