import { Link, NavLink, useLocation, useParams } from 'react-router';
import { pickFeatured, useTournamentsRegistry } from '@/data/tournaments-registry';
import { registrationsOpen } from '@/data/tournament';
import { useSiteMode } from '@/data/use-site-mode';
import { modeBadge, type ModeBadge } from '@/lib/site-state';
import { cn } from '@/lib/utils';

const links = [
  { to: 'gironi', label: 'Gironi' },
  { to: 'risultati', label: 'Risultati' },
  { to: 'classifiche', label: 'Classifiche' },
  { to: 'iscrizioni', label: 'Iscrizioni' },
  { to: 'albo-d-oro', label: "Albo d'Oro" },
];

const pillCls = ({ isActive }: { isActive: boolean }) =>
  cn(
    'whitespace-nowrap rounded-full px-3 py-1.5 font-display text-[13px] uppercase tracking-[0.1em] transition-colors',
    isActive ? 'bg-primary/[0.18] text-white hover:text-white' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white',
  );

function StatusDot({ badge }: { badge: ModeBadge }) {
  return (
    <span className="relative inline-block h-2 w-2">
      {badge.ping && <span className={cn('absolute inset-0 animate-jb-ping rounded-full', badge.dotClassName)} />}
      <span className={cn('absolute inset-0 rounded-full', badge.dotClassName)} />
    </span>
  );
}

export default function Navbar() {
  const { slug } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const { tournaments } = useTournamentsRegistry();

  const current = slug ? tournaments.find((t) => t.slug === slug) : undefined;
  const active = current ?? pickFeatured(tournaments);
  const badge = modeBadge[useSiteMode()];

  const isAdmin = pathname.split('/').includes('admin');
  const section = pathname.split('/')[2] ?? '';
  const showTourBar = Boolean(current) && !isAdmin && tournaments.length > 1;

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-white/[0.06] bg-black/[0.82] backdrop-blur-[12px]">
        <div className="mx-auto flex min-h-[68px] max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-3 hover:text-white">
            <img src="/logo.png" alt="Logo Joga Bonito" className="h-11 w-11 object-contain mix-blend-screen" />
            <span className="font-display text-[21px] tracking-[0.04em] text-white">
              TORNEO <span className="hidden text-primary min-[400px]:inline">JOGABONITO</span>
            </span>
          </Link>

          <nav className="order-last flex min-w-0 basis-full flex-wrap items-center justify-center gap-0.5 lg:order-none lg:flex-1 lg:basis-auto">
            <NavLink to="/" end className={pillCls}>
              Home
            </NavLink>
            {active &&
              links.map((l) => (
                <NavLink key={l.to} to={`/${active.slug}/${l.to}`} className={pillCls}>
                  {l.label}
                </NavLink>
              ))}
            <NavLink to="/archivio" className={pillCls}>
              Archivio
            </NavLink>
            {active && (
              <NavLink to={`/${active.slug}/regolamento`} className={pillCls}>
                Regolamento
              </NavLink>
            )}
          </nav>

          <Link
            to={active ? `/${active.slug}/risultati` : '/'}
            className={cn(
              'flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] hover:text-current',
              badge.className,
            )}
          >
            <StatusDot badge={badge} />
            {badge.label}
          </Link>
        </div>
      </div>

      {/* Barra tornei: solo nelle pagine interne e con più tornei attivi */}
      {showTourBar && (
        <div className="border-b border-white/[0.06] bg-black/[0.82] backdrop-blur-[12px]">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-2.5 gap-y-2 px-4 py-2.5 sm:px-6">
            <span className="label-xs mr-1.5">Tornei</span>
            {tournaments.map((t) => {
              const on = t.slug === current?.slug;
              const live = t.data.matches.some((m) => m.status === 'live');
              const open = registrationsOpen(t.data);
              return (
                <Link
                  key={t.slug}
                  to={`/${t.slug}/${section}`}
                  className={cn(
                    'flex items-center gap-2.5 whitespace-nowrap rounded-full border px-4 py-2 font-display text-sm uppercase tracking-[0.08em] transition-colors',
                    on
                      ? 'border-primary bg-primary/[0.16] text-white hover:text-white'
                      : 'border-white/[0.12] text-zinc-400 hover:border-primary/50 hover:text-white',
                  )}
                >
                  {t.name}
                  {(live || open) && (
                    <span
                      className={cn(
                        'font-body text-[11px] font-bold tracking-[0.14em]',
                        live ? 'text-red-400' : 'text-green-400',
                      )}
                    >
                      {live ? '● Live' : 'Iscrizioni aperte'}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
