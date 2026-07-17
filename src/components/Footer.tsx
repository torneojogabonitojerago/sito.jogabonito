import { Link } from 'react-router';
import { Instagram, MapPin, Lock } from 'lucide-react';
import { useTournament } from '@/data/store';
import TikTokIcon from './TikTokIcon';

export default function Footer() {
  const { data } = useTournament();

  return (
    <footer className="border-t border-white/5 bg-black py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center">
        <div className="flex items-center gap-5 text-zinc-400">
          <a href="https://www.instagram.com/tornei_jogabonito_jerago?igsh=Znh5d2R3dTZ1YWlv" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors hover:text-primary">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="https://www.tiktok.com/@torneo.joga.bonit?_r=1&_t=ZN-986yMJ512m6" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="transition-colors hover:text-primary">
            <TikTokIcon className="h-5 w-5" />
          </a>
        </div>
        <p className="flex items-center gap-2 text-sm text-zinc-500">
          <MapPin className="h-4 w-4 text-primary" />
          {data.info.location} · {data.info.dates}
        </p>
        <p className="font-display text-xs uppercase tracking-[0.3em] text-zinc-600">
          {data.info.name} · {data.info.brushSubtitle} · {data.info.organizer}
        </p>
        <Link
          to="/admin"
          className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-700 transition-colors hover:text-primary"
        >
          <Lock className="h-3 w-3" />
          Area organizzatori
        </Link>
      </div>
    </footer>
  );
}
