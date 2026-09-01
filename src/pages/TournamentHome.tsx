import { Link } from 'react-router';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  MapPin,
  RadioTower,
  Rocket,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Users,
  Volleyball,
} from 'lucide-react';
import { useTournament } from '@/data/store';
import type { TournamentData } from '@/data/tournament';
import MatchCard from '@/components/MatchCard';
import CountdownTimer from '@/components/CountdownTimer';
import AnimatedNumber from '@/components/AnimatedNumber';

function EventCard() {
  const { data } = useTournament();
  const { openingNight } = data;

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

      <div className="relative mt-6 flex items-start gap-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-cyan-500/10 p-5 backdrop-blur-sm">
        <div className="relative">
          <Shirt className="mt-0.5 h-7 w-7 shrink-0 text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.6)]" />
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]">{openingNight.note.title}</p>
          <p className="mt-1.5 text-sm text-zinc-200 leading-relaxed">{openingNight.note.text}</p>
        </div>
      </div>
    </div>
  );
}

function GroupEntryCard({ group, title }: { group: 'A'; title: string }) {
  const { data } = useTournament();
  const groupTeams = data.teams.filter((t) => t.group === group);

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-5 rounded-xl border border-white/10 bg-gradient-to-br from-[#101010] to-[#0a0a0a] p-7 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(255,0,255,0.2)] hover:-translate-y-1">
      <div className="relative">
        <Volleyball className="h-16 w-16 text-white drop-shadow-[0_0_15px_rgba(255,0,255,0.5)]" strokeWidth={1.2} />
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
      </div>
      <h3 className="font-display text-2xl uppercase tracking-wide text-white drop-shadow-[0_0_10px_rgba(255,0,255,0.4)]">{title}</h3>
      <ul className="w-full space-y-2 text-center text-sm text-zinc-300">
        {groupTeams.map((t) => (
          <li key={t.id} className="uppercase tracking-wide py-1 px-3 rounded-lg hover:bg-white/5 transition-colors">
            {t.name}
          </li>
        ))}
      </ul>
      <Link
        to="gironi"
        className="mt-2 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary hover:shadow-[0_0_20px_rgba(255,0,255,0.5)]"
      >
        Entra nella sezione
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function StateBadge({ icon: Icon, label, className }: { icon: typeof Rocket; label: string; className: string }) {
  return (
    <span className={`mx-auto flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${className}`}>
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

function trailerEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}

/* ============================================================
   PRE-SEASON
   ============================================================ */

function PreSeasonHome({ data }: { data: TournamentData }) {
  const nameParts = data.info.name.split(' ');
  const sortedMatches = [...data.matches].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const countdownTarget = sortedMatches[0] ? `${sortedMatches[0].date}T${sortedMatches[0].time}:00` : null;

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:pt-32">
        <div className="bg-fade-radial pointer-events-none absolute inset-0" />
        <div className="relative">
          <StateBadge icon={Rocket} label="Pre-season" className="border-sky-500/40 bg-sky-500/10 text-sky-400" />

          <h1 className="font-display title-glow mt-6 text-center text-[18vw] uppercase leading-[0.92] text-white sm:text-9xl md:text-[10rem]">
            {nameParts[0]}
            {nameParts.length > 1 && <span className="block sm:inline"> {nameParts.slice(1).join(' ')}</span>}
          </h1>
          <p className="font-brush brush-glow mt-4 -rotate-1 text-center text-5xl text-primary sm:text-6xl drop-shadow-[0_0_30px_rgba(0,255,255,0.6)]">
            {data.info.brushSubtitle}
          </p>

          {countdownTarget && (
            <div className="mt-12">
              <p className="mb-4 text-center font-display text-sm uppercase tracking-[0.3em] text-zinc-500">Si comincia tra</p>
              <CountdownTimer target={countdownTarget} />
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            {data.preSeason.registrationsOpen && (
              <Link
                to="iscrizioni"
                className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-cyan-500 px-10 py-4 font-display text-lg uppercase tracking-widest text-white shadow-[0_0_40px_rgba(255,0,255,0.4),0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,0,255,0.6),0_0_40px_rgba(0,255,255,0.5)]"
              >
                Iscrivi la tua squadra
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <Link
              to="regolamento"
              className="flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 font-display text-lg uppercase tracking-widest text-zinc-200 transition-colors hover:border-primary hover:text-primary"
            >
              Regolamento
            </Link>
          </div>
        </div>
      </section>

      {data.preSeason.trailerUrl && (
        <section className="mx-auto max-w-4xl px-4 pb-20">
          <div className="aspect-video overflow-hidden rounded-xl border border-white/10 shadow-[0_0_60px_rgba(255,0,255,0.15)]">
            <iframe
              src={trailerEmbedUrl(data.preSeason.trailerUrl)}
              className="h-full w-full"
              title="Trailer torneo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <EventCard />
      </section>

      {data.teams.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pb-24">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">Squadre confermate</h2>
            <p className="font-brush mt-1 text-2xl text-primary">chi c'è già</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {data.teams.map((t) => (
              <li
                key={t.id}
                className="rounded-md border border-white/10 bg-[#101010] px-4 py-3 text-center font-display uppercase tracking-wide text-zinc-200"
              >
                {t.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ============================================================
   LIVE SEASON
   ============================================================ */

function LiveSeasonHome({ data }: { data: TournamentData }) {
  const nameParts = data.info.name.split(' ');

  const upcoming = data.matches
    .filter((m) => m.status === 'scheduled' || m.status === 'live')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const nextMatch = upcoming[0];

  const currentEdition = data.hallOfFame[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:pt-32">
        <div className="bg-fade-radial pointer-events-none absolute inset-0" />
        <div className="relative">
          <EventCard />

          <h1 className="font-display title-glow mt-12 text-center text-[18vw] uppercase leading-[0.92] text-white sm:text-9xl md:text-[10rem]">
            {nameParts[0]}
            {nameParts.length > 1 && (
              <span className="block sm:inline"> {nameParts.slice(1).join(' ')}</span>
            )}
          </h1>
          <p className="font-brush brush-glow mt-4 -rotate-1 text-center text-5xl text-primary sm:text-6xl drop-shadow-[0_0_30px_rgba(0,255,255,0.6)]">
            {data.info.brushSubtitle}
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            <GroupEntryCard group="A" title="Girone unico" />
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              to="risultati"
              className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-cyan-500 px-10 py-4 font-display text-lg uppercase tracking-widest text-white shadow-[0_0_40px_rgba(255,0,255,0.4),0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,0,255,0.6),0_0_40px_rgba(0,255,255,0.5)]"
            >
              <RadioTower className="h-5 w-5 group-hover:animate-pulse" />
              Punteggi & Risultati
            </Link>
          </div>

          {/* info rapide */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              { icon: CalendarDays, label: 'Date', value: data.info.dates },
              { icon: MapPin, label: 'Campo', value: data.info.location },
              { icon: Users, label: 'Squadre', value: `${data.teams.length} iscritte` },
              { icon: Trophy, label: 'Formula', value: 'Girone unico + finali' },
            ].map((i) => (
              <div key={i.label} className="group rounded-xl border border-white/10 bg-gradient-to-br from-[#101010] to-[#0a0a0a] p-5 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(255,0,255,0.2)] hover:-translate-y-1">
                <div className="relative inline-block">
                  <i.icon className="mx-auto h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]" />
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">{i.label}</p>
                <p className="mt-1.5 text-sm font-semibold text-white group-hover:text-primary transition-colors">{i.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROSSIMA PARTITA */}
      {nextMatch && (
        <section className="mx-auto max-w-2xl px-4 pb-16">
          <div className="mb-4 text-center">
            <StateBadge icon={RadioTower} label="Prossima partita" className="border-red-500/40 bg-red-500/10 text-red-400" />
          </div>
          <MatchCard match={nextMatch} teams={data.teams} />
        </section>
      )}

      {/* PROSSIME PARTITE */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
              Prossime partite
            </h2>
            <p className="font-brush mt-1 text-2xl text-primary">il cammino verso la finale</p>
          </div>
          <Link
            to="risultati"
            className="hidden items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-primary sm:flex"
          >
            Tutto il calendario
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 3).map((m) => (
            <MatchCard key={m.id} match={m} teams={data.teams} />
          ))}
        </div>
      </section>

      {/* MVP */}
      {currentEdition?.mvp && (
        <section className="mx-auto max-w-md px-4 pb-24">
          <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">MVP di stagione</p>
            <p className="mt-1 font-display text-lg uppercase tracking-wide text-white">{currentEdition.mvp}</p>
          </div>
        </section>
      )}
    </div>
  );
}

/* ============================================================
   OFF-SEASON
   ============================================================ */

function OffSeasonHome({ data }: { data: TournamentData }) {
  const nameParts = data.info.name.split(' ');
  const currentEdition = data.hallOfFame[0];
  const finishedMatches = data.matches.filter((m) => m.status === 'finished');
  const totalGoals = finishedMatches.reduce((sum, m) => sum + m.sets.reduce((s, set) => s + set.home + set.away, 0), 0);
  const hasChampion = currentEdition && currentEdition.winner && currentEdition.winner !== 'Da definire';

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:pt-32">
        <div className="bg-fade-radial pointer-events-none absolute inset-0" />
        <div className="relative">
          <StateBadge icon={Trophy} label="Off-season" className="border-amber-500/40 bg-amber-500/10 text-amber-400" />

          <h1 className="font-display title-glow mt-6 text-center text-[18vw] uppercase leading-[0.92] text-white sm:text-9xl md:text-[10rem]">
            {nameParts[0]}
            {nameParts.length > 1 && <span className="block sm:inline"> {nameParts.slice(1).join(' ')}</span>}
          </h1>
          <p className="font-brush brush-glow mt-4 -rotate-1 text-center text-5xl text-primary sm:text-6xl drop-shadow-[0_0_30px_rgba(0,255,255,0.6)]">
            {data.info.brushSubtitle}
          </p>

          {hasChampion && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="relative">
                <Trophy className="h-16 w-16 text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]" />
                <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Campione {currentEdition.year}</p>
              <p className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">{currentEdition.winner}</p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="classifiche"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-cyan-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white shadow-[0_0_30px_rgba(255,0,255,0.35)]"
            >
              Classifica finale
            </Link>
            <Link
              to="risultati"
              className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-sm uppercase tracking-widest text-zinc-200 hover:border-primary hover:text-primary"
            >
              Risultati completi
            </Link>
            <Link
              to="albo-d-oro"
              className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-sm uppercase tracking-widest text-zinc-200 hover:border-primary hover:text-primary"
            >
              Albo d'oro
            </Link>
          </div>
        </div>
      </section>

      {/* STATISTICHE */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#101010] to-[#0a0a0a] p-6 sm:p-8">
          <h3 className="mb-6 text-center font-display text-2xl uppercase tracking-wide text-white">Statistiche stagione</h3>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="text-center">
              <AnimatedNumber value={finishedMatches.length} className="font-display text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Partite giocate</p>
            </div>
            <div className="text-center">
              <AnimatedNumber value={totalGoals} className="font-display text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Punti totali</p>
            </div>
            <div className="text-center">
              <AnimatedNumber value={data.teams.length} className="font-display text-4xl font-bold text-white" />
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Squadre</p>
            </div>
            <div className="text-center">
              <AnimatedNumber value={data.hallOfFame.length} className="font-display text-4xl font-bold text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Edizioni</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOTO (placeholder) */}
      <section className="mx-auto max-w-4xl px-4 pb-16 text-center">
        <Camera className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
        <p className="text-sm uppercase tracking-widest text-zinc-600">Foto della stagione in arrivo</p>
      </section>

      {/* TEASER PROSSIMA STAGIONE */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-black/80 via-black/70 to-primary/10 p-8 text-center backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5" />
          <div className="relative">
            <Sparkles className="mx-auto mb-3 h-7 w-7 text-primary" />
            <h3 className="font-display title-glow text-2xl uppercase tracking-wide text-white sm:text-3xl">
              {data.offSeason.teaserTitle}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{data.offSeason.teaserMessage}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TournamentHome() {
  const { data } = useTournament();

  if (data.siteState === 'pre-season') return <PreSeasonHome data={data} />;
  if (data.siteState === 'off-season') return <OffSeasonHome data={data} />;
  return <LiveSeasonHome data={data} />;
}
