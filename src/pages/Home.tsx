import { Link } from 'react-router';
import { ArrowRight, Star, Trophy } from 'lucide-react';
import { useTournamentsRegistry, type TournamentSummary } from '@/data/tournaments-registry';
import { siteStateBadge } from '@/lib/site-state';
import { cn } from '@/lib/utils';

function EventCard({ openingNight }: { openingNight: TournamentSummary['openingNight'] }) {
  return (
    <div className="relative mx-auto w-full max-w-3xl rounded-lg border border-primary/40 bg-gradient-to-br from-black/80 via-black/70 to-primary/10 p-6 shadow-[0_0_80px_rgba(255,0,255,0.15),0_0_40px_rgba(0,255,255,0.1)] backdrop-blur-md sm:p-8">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5" />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <Star className="h-8 w-8 fill-primary text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
        </div>
        <span className="rounded-full bg-gradient-to-r from-primary to-cyan-500 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(255,0,255,0.4)]">
          {openingNight.badge}
        </span>
        <h2 className="font-display mt-2 text-3xl uppercase tracking-wide text-white sm:text-4xl drop-shadow-[0_0_25px_rgba(255,0,255,0.3)]">
          {openingNight.title}
        </h2>
      </div>

      <div className="relative mt-8 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5 sm:p-6 backdrop-blur-sm">
        {openingNight.schedule.map((s, i) => (
          <div
            key={`${s.time}-${i}`}
            className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-2 -mx-2"
          >
            <span className="font-display text-xl font-bold text-primary drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]">{s.time}</span>
            <span className="text-right font-display text-sm uppercase tracking-widest text-zinc-200 sm:text-base">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {(openingNight.note.title || openingNight.note.text) && (
        <div className="relative mt-6 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-cyan-500/10 p-5 backdrop-blur-sm">
          <p className="font-display text-sm uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]">{openingNight.note.title}</p>
          <p className="mt-1.5 text-sm text-zinc-200 leading-relaxed">{openingNight.note.text}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { tournaments, loading, error } = useTournamentsRegistry();

  const featured =
    tournaments.find((t) => t.siteState === 'live-season') ?? tournaments.find((t) => t.siteState === 'pre-season');

  return (
    <div>
      {/* HERO — identità del sito, fissa */}
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:pt-36">
        <div className="bg-fade-radial pointer-events-none absolute inset-0" />
        <div className="relative">
          {featured && (
            <div className="mb-12">
              <EventCard openingNight={featured.openingNight} />
            </div>
          )}
          <div className="text-center">
            <h1 className="font-display title-glow text-[16vw] uppercase leading-[0.92] text-white sm:text-8xl md:text-9xl">
              TORNEO
              <span className="block sm:inline"> JOGABONITO</span>
            </h1>
            <p className="font-brush brush-glow mt-4 -rotate-1 text-4xl text-primary sm:text-5xl drop-shadow-[0_0_30px_rgba(0,255,255,0.6)]">
              Festa Patronale
            </p>
          </div>
        </div>
      </section>

      {/* I NOSTRI TORNEI */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="mb-8 flex items-center justify-center gap-2.5 text-center">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">I nostri tornei</h2>
        </div>

        {loading ? (
          <p className="text-center text-sm text-zinc-500">Caricamento…</p>
        ) : error ? (
          <p className="text-center text-sm text-red-400">{error}</p>
        ) : tournaments.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">Nessun torneo al momento. Torna a trovarci presto!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => {
              const badge = siteStateBadge[t.siteState];
              return (
                <Link
                  key={t.slug}
                  to={`/${t.slug}`}
                  className="group flex flex-col gap-5 rounded-xl border border-white/10 bg-gradient-to-br from-[#101010] to-[#0a0a0a] p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(255,0,255,0.2)] hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest',
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
                    <ArrowRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{t.sport}</p>
                    <h2 className="font-display mt-1 text-2xl uppercase tracking-wide text-white transition-colors group-hover:text-primary">
                      {t.name}
                    </h2>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
