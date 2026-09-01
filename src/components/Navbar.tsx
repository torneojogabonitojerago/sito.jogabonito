import { useState } from 'react';
import { Link, NavLink, useParams } from 'react-router';
import { Menu, X, Volleyball } from 'lucide-react';
import { useTournamentsRegistry } from '@/data/tournaments-registry';
import { siteStateBadge } from '@/lib/site-state';
import { cn } from '@/lib/utils';

const links = [
  { to: '', label: 'Home' },
  { to: 'gironi', label: 'Gironi' },
  { to: 'risultati', label: 'Risultati' },
  { to: 'classifiche', label: 'Classifiche' },
  { to: 'albo-d-oro', label: 'Albo d\'Oro' },
  { to: 'regolamento', label: 'Regolamento' },
];

/* Nome dell'organizzazione — fisso, non cambia in base al torneo mostrato */
const SITE_BRAND = ['TORNEO', 'JOGABONITO'];

function LogoMark() {
  const [imgOk, setImgOk] = useState(true);
  /* Per usare il logo ufficiale basta mettere il file in  public/logo.png  */
  if (imgOk) {
    return (
      <img
        src="/logo.png"
        alt="Logo del torneo"
        className="h-10 w-10 object-contain"
        onError={() => setImgOk(false)}
      />
    );
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-white shadow-[0_0_18px_rgba(255,77,0,0.5)]">
      <Volleyball className="h-6 w-6" strokeWidth={1.8} />
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { slug } = useParams<{ slug: string }>();
  const { tournaments } = useTournamentsRegistry();
  const current = slug ? tournaments.find((t) => t.slug === slug) : undefined;

  const badge = current ? siteStateBadge[current.siteState] : null;
  const navLinks = current?.siteState === 'pre-season' ? [...links, { to: 'iscrizioni', label: 'Iscrizioni' }] : links;
  const base = slug ? `/${slug}` : '/';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <LogoMark />
          <span className="font-display text-xl tracking-wide text-white">
            {SITE_BRAND[0]}
            <span className="ml-2 hidden text-primary sm:inline">{SITE_BRAND.slice(1).join(' ')}</span>
          </span>
          {current && badge && (
            <span
              className={cn(
                'hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest sm:flex',
                badge.className,
              )}
            >
              {badge.pulse ? (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              ) : (
                <badge.icon className="h-3 w-3" />
              )}
              {badge.label}
            </span>
          )}
        </Link>

        {/* Desktop */}
        {current && (
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={`${base}/${l.to}`}
                end={l.to === ''}
                className={({ isActive }) =>
                  cn(
                    'font-display text-sm uppercase tracking-widest transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-zinc-400',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Mobile toggle */}
        {current && (
          <button
            className="text-zinc-300 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {current && open && (
        <nav className="border-t border-white/5 bg-black/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={`${base}/${l.to}`}
                end={l.to === ''}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded px-3 py-3 font-display text-base uppercase tracking-widest transition-colors',
                    isActive ? 'bg-white/5 text-primary' : 'text-zinc-300 hover:text-primary',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
