import { Link } from 'react-router';
import { ArrowRight, CalendarDays, MapPin, RadioTower, Shirt, Star, Trophy, Users, Volleyball } from 'lucide-react';
import { useTournament } from '@/data/store';
import MatchCard from '@/components/MatchCard';

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
        to="/gironi"
        className="mt-2 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary hover:shadow-[0_0_20px_rgba(255,0,255,0.5)]"
      >
        Entra nella sezione
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default function Home() {
  const { data } = useTournament();

  const upcoming = data.matches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 3);

  const nameParts = data.info.name.split(' ');

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
              to="/risultati"
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
            to="/risultati"
            className="hidden items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-primary sm:flex"
          >
            Tutto il calendario
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((m) => (
            <MatchCard key={m.id} match={m} teams={data.teams} />
          ))}
        </div>
      </section>
    </div>
  );
}
