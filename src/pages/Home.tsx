import { Link } from 'react-router';
import { ArrowRight, CalendarDays, MapPin, RadioTower, Shirt, Star, Trophy, Users, Volleyball } from 'lucide-react';
import { useTournament } from '@/data/store';
import MatchCard from '@/components/MatchCard';

function EventCard() {
  const { data } = useTournament();
  const { openingNight } = data;

  return (
    <div className="relative mx-auto w-full max-w-3xl rounded-md border border-primary/30 bg-black/70 p-6 shadow-[0_0_60px_rgba(255,77,0,0.12)] backdrop-blur-sm sm:p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Star className="h-7 w-7 fill-primary text-primary" />
        <span className="rounded-sm bg-primary px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          {openingNight.badge}
        </span>
        <h2 className="font-display mt-1 text-2xl uppercase tracking-wide text-white sm:text-3xl">
          {openingNight.title}
        </h2>
      </div>

      <div className="mt-6 rounded-md border border-white/8 bg-[#0d0d0d] p-4 sm:p-5">
        {openingNight.schedule.map((s, i) => (
          <div
            key={`${s.time}-${i}`}
            className="flex items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-0"
          >
            <span className="font-display text-lg text-primary">{s.time}</span>
            <span className="text-right font-display text-sm uppercase tracking-widest text-zinc-200 sm:text-base">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-md border border-primary/25 bg-primary/[0.07] p-4">
        <Shirt className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
        <div>
          <p className="font-display text-sm uppercase tracking-widest text-primary">{openingNight.note.title}</p>
          <p className="mt-1 text-sm text-zinc-300">{openingNight.note.text}</p>
        </div>
      </div>
    </div>
  );
}

function GroupEntryCard({ group, title }: { group: 'A'; title: string }) {
  const { data } = useTournament();
  const groupTeams = data.teams.filter((t) => t.group === group);

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-md border border-white/8 bg-[#101010]/90 p-6 transition-colors hover:border-primary/40">
      <Volleyball className="h-14 w-14 text-white" strokeWidth={1.2} />
      <h3 className="font-display text-xl uppercase tracking-wide text-white">{title}</h3>
      <ul className="w-full space-y-1 text-center text-sm text-zinc-400">
        {groupTeams.map((t) => (
          <li key={t.id} className="uppercase tracking-wide">
            {t.name}
          </li>
        ))}
      </ul>
      <Link
        to="/gironi"
        className="mt-1 flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-200 transition-colors hover:border-primary hover:text-primary"
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

          <h1 className="font-display title-glow mt-10 text-center text-[17vw] uppercase leading-[0.95] text-white sm:text-8xl md:text-9xl">
            {nameParts[0]}
            {nameParts.length > 1 && (
              <span className="block sm:inline"> {nameParts.slice(1).join(' ')}</span>
            )}
          </h1>
          <p className="font-brush brush-glow mt-2 -rotate-2 text-center text-4xl text-primary sm:text-5xl">
            {data.info.brushSubtitle}
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            <GroupEntryCard group="A" title="Girone unico" />
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/risultati"
              className="flex items-center gap-3 rounded-full bg-primary px-8 py-3.5 font-display text-lg uppercase tracking-widest text-white shadow-[0_0_35px_rgba(255,77,0,0.55)] transition-transform hover:scale-105"
            >
              <RadioTower className="h-5 w-5" />
              Punteggi & Risultati
            </Link>
          </div>

          {/* info rapide */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: CalendarDays, label: 'Date', value: data.info.dates },
              { icon: MapPin, label: 'Campo', value: data.info.location },
              { icon: Users, label: 'Squadre', value: `${data.teams.length} iscritte` },
              { icon: Trophy, label: 'Formula', value: 'Girone unico + finali' },
            ].map((i) => (
              <div key={i.label} className="rounded-md border border-white/8 bg-[#101010] p-4 text-center">
                <i.icon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">{i.label}</p>
                <p className="mt-1 text-sm font-semibold text-zinc-200">{i.value}</p>
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
