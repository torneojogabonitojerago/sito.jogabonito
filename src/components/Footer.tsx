import { Link } from 'react-router';
import { Instagram, Lock } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/site-state';
import TikTokIcon from './TikTokIcon';

const socialCls =
  'flex items-center gap-2 py-2 text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3.5">
          <img src="/logo.png" alt="" className="h-14 w-14 object-contain" />
          <span className="font-display text-[13px] uppercase tracking-[0.3em] text-zinc-500">
            Tornei Joga Bonito · Festa Patronale
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className={socialCls}>
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
          <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className={socialCls}>
            <TikTokIcon className="h-4 w-4" />
            TikTok
          </a>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:text-primary"
          >
            <Lock className="h-3 w-3" />
            Area organizzatori
          </Link>
        </div>
      </div>
    </footer>
  );
}
