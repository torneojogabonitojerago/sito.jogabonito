import { Link } from 'react-router';
import { pickFeatured, useTournamentsRegistry, type TournamentSummary } from '@/data/tournaments-registry';
import {
  byDateTime,
  championOf,
  computeStandings,
  formatDay,
  nextMatch,
  registrationsOpen,
  setsWon,
  teamName,
  type TournamentData,
} from '@/data/tournament';
import CountdownTimer from '@/components/CountdownTimer';
import { useSiteConfig } from '@/data/site-config';
import { useSiteMode } from '@/data/use-site-mode';
import { SOCIAL_LINKS, type SiteMode } from '@/lib/site-state';
import { cn } from '@/lib/utils';

/* La home è UGUALE per tutti i tornei: aggrega quelli attivi. */

/** Inizio (timestamp) della prima partita in calendario. */
function startOf(list: TournamentData[]): number | null {
  const first = list
    .flatMap((d) => d.matches)
    .filter((m) => m.date)
    .sort(byDateTime)[0];
  if (!first) return null;
  const ts = new Date(`${first.date}T${first.time || '00:00'}:00`).getTime();
  return Number.isNaN(ts) ? null : ts;
}

/* ---------- card a destra nell'hero ---------- */

function NextMatchCard({ list }: { list: TournamentSummary[] }) {
  const found =
    list.map((t) => ({ t, m: t.data.matches.find((m) => m.status === 'live') })).find((x) => x.m) ??
    list
      .flatMap((t) => t.data.matches.filter((m) => m.status === 'scheduled').map((m) => ({ t, m })))
      .sort((a, b) => byDateTime(a.m, b.m))[0];
  if (!found?.m) return null;

  const { t, m } = found;
  const live = m.status === 'live';
  const sw = setsWon(m);

  return (
    <div className="relative mt-7 w-full max-w-[500px] overflow-hidden rounded-2xl border border-primary/40 bg-[linear-gradient(135deg,rgba(0,0,0,0.85),rgba(20,0,20,0.85))] shadow-[0_0_80px_rgba(255,0,255,0.18),0_0_40px_rgba(0,255,255,0.1)] backdrop-blur-[10px]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
        <span
          className={cn('text-[11px] font-bold uppercase tracking-[0.22em]', live ? 'text-red-400' : 'text-primary')}
        >
          {live ? '● In campo ora' : 'Prossima partita'}
          <span className="text-zinc-500"> · {t.name}</span>
        </span>
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {live ? `Set ${sw.home + sw.away + 1}` : `${formatDay(m.date)} · ${m.time}`}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-5 pb-6 pt-[22px]">
        <span className="font-display text-[clamp(22px,2.4vw,30px)] uppercase leading-[1.05] text-white [text-wrap:balance]">
          {teamName(t.data.teams, m, 'home')}
        </span>
        <span
          className={cn(
            'whitespace-nowrap font-display text-primary [text-shadow:0_0_14px_rgba(255,0,255,0.6)]',
            live ? 'text-[clamp(40px,4.4vw,56px)]' : 'text-[28px]',
          )}
        >
          {live ? `${sw.home} – ${sw.away}` : 'VS'}
        </span>
        <span className="text-right font-display text-[clamp(22px,2.4vw,30px)] uppercase leading-[1.05] text-white [text-wrap:balance]">
          {teamName(t.data.teams, m, 'away')}
        </span>
      </div>
    </div>
  );
}

function ChampionsCard({ list }: { list: TournamentSummary[] }) {
  return (
    <div className="relative mt-7 w-full max-w-[500px] overflow-hidden rounded-2xl border border-amber-500/[0.45] bg-[linear-gradient(135deg,rgba(0,0,0,0.88),rgba(28,18,2,0.88))] shadow-[0_0_80px_rgba(245,158,11,0.18)] backdrop-blur-[10px]">
      <div className="border-b border-white/[0.08] px-5 py-3.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">I campioni</span>
      </div>
      {list.map((t) => (
        <div
          key={t.slug}
          className="flex items-center justify-between gap-3.5 border-t border-white/5 px-5 py-4 first-of-type:border-t-0"
        >
          <span className="label-xs">{t.name}</span>
          <span className="text-right font-display text-[clamp(22px,2.4vw,28px)] uppercase leading-[1.05] text-white [text-shadow:0_0_18px_rgba(245,158,11,0.4)]">
            {championOf(t.data)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- card torneo ---------- */

const statusStyle = {
  post: ['Concluso', 'text-amber-400 bg-amber-500/[0.12]'],
  open: ['Iscrizioni aperte', 'text-green-400 bg-green-500/[0.12]'],
  soon: ['In arrivo', 'text-cyan-400 bg-cyan-400/[0.12]'],
  live: ['● Live', 'text-red-400 bg-red-500/[0.12]'],
  running: ['In corso', 'text-cyan-400 bg-cyan-400/[0.12]'],
  idle: ['In arrivo', 'text-zinc-400 bg-white/[0.06]'],
} as const;

function TournamentCard({ t, mode }: { t: TournamentSummary; mode: SiteMode }) {
  const d = t.data;
  const ms = d.matches;
  const done = ms.filter((m) => m.status === 'finished').length;
  const live = ms.some((m) => m.status === 'live');
  const open = registrationsOpen(d);
  const over = ms.length > 0 && done === ms.length;
  const up = nextMatch(ms);
  const playedGroups = ms.some((m) => m.phase === 'gironi' && m.status === 'finished');
  const leader = playedGroups ? computeStandings(d.teams, ms)[0] : undefined;

  const status =
    mode === 'post'
      ? statusStyle.post
      : mode === 'pre'
        ? open
          ? statusStyle.open
          : statusStyle.soon
        : live
          ? statusStyle.live
          : open
            ? statusStyle.open
            : over
              ? statusStyle.post
              : ms.length
                ? statusStyle.running
                : statusStyle.idle;

  const progress =
    mode === 'pre'
      ? `${d.teams.length} squadre iscritte`
      : ms.length
        ? `${done}/${ms.length} partite`
        : 'Calendario in arrivo';

  const lead =
    mode === 'post'
      ? { label: 'Campione', value: championOf(d), gold: true }
      : mode === 'pre'
        ? { label: 'Squadre', value: String(d.teams.length), gold: false }
        : { label: 'Capolista', value: leader?.team.name ?? '—', gold: false };

  const next =
    mode === 'post'
      ? { label: 'Bilancio', title: `${done} partite giocate`, sub: d.info.dates, color: 'text-zinc-500' }
      : mode === 'pre'
        ? {
            label: 'Iscrizioni',
            title: open ? 'Aperte' : 'Chiuse',
            sub: open ? 'Compila il modulo' : 'Apriranno a breve',
            color: open ? 'text-green-400' : 'text-zinc-500',
          }
        : {
            label: up?.status === 'live' ? 'In campo ora' : 'Prossima partita',
            title: up ? `${teamName(d.teams, up, 'home')} vs ${teamName(d.teams, up, 'away')}` : 'Da definire',
            sub: up ? (up.status === 'live' ? 'Live' : `${formatDay(up.date)} · ${up.time}`) : '',
            color: up?.status === 'live' ? 'text-red-400' : 'text-primary',
          };

  const info = [d.info.dates, d.info.location].filter(Boolean).join(' · ') || 'Date da definire';

  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#101010] transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-[0_10px_40px_rgba(255,0,255,0.15)]">
      <div className="flex flex-col gap-2.5 border-b-2 border-primary bg-[linear-gradient(160deg,rgba(255,0,255,0.08),transparent_60%)] px-6 pb-5 pt-6">
        <div className="flex items-center justify-between gap-2.5">
          <span
            className={cn(
              'whitespace-nowrap rounded-full px-[11px] py-[5px] text-[11px] font-bold uppercase tracking-[0.16em]',
              status[1],
            )}
          >
            {status[0]}
          </span>
          <span className="label-xs whitespace-nowrap">{progress}</span>
        </div>
        <span className="font-display text-[34px] uppercase leading-none text-white">{t.name}</span>
        <span className="text-sm font-semibold text-zinc-400">{info}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 py-[18px]">
        <div className="flex min-w-0 flex-col gap-[3px]">
          <span className="label-xs">{lead.label}</span>
          <span
            className={cn(
              'truncate font-display text-lg uppercase',
              lead.gold ? 'text-amber-400' : 'text-white',
            )}
          >
            {lead.value}
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-[3px]">
          <span className="label-xs">{next.label}</span>
          <span className="font-display text-base uppercase leading-[1.15] text-white">{next.title}</span>
          {next.sub && (
            <span className={cn('text-xs font-bold uppercase tracking-[0.1em]', next.color)}>{next.sub}</span>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-white/[0.06] px-6 pb-[22px] pt-4">
        {open && (
          <Link to={`/${t.slug}/iscrizioni`} className="btn-neon px-[18px] py-2.5 text-sm shadow-none">
            Iscriviti
          </Link>
        )}
        <Link to={`/${t.slug}/risultati`} className="btn-ghost px-[18px] py-2.5 text-sm">
          Risultati
        </Link>
        <Link to={`/${t.slug}/classifiche`} className="btn-ghost px-[18px] py-2.5 text-sm">
          Classifica
        </Link>
      </div>
    </div>
  );
}

/* ---------- pagina ---------- */

export default function Home() {
  const { tournaments, loading, error } = useTournamentsRegistry();
  const { config } = useSiteConfig();
  const home = config.home;
  const mode = useSiteMode();

  const datas = tournaments.map((t) => t.data);
  const featured = pickFeatured(tournaments);
  const firstOpen = tournaments.find((t) => registrationsOpen(t.data));
  const firstAlbo = tournaments.find((t) => t.data.hallOfFame.length > 0) ?? featured;

  // inizio del torneo per il countdown: quello impostato in admin, altrimenti la prima partita
  const configuredStart = home.start ? new Date(home.start).getTime() : NaN;
  const start = Number.isNaN(configuredStart) ? startOf(datas) : configuredStart;

  const teamsCount = datas.reduce((n, d) => n + d.teams.length, 0);

  const progressShort =
    mode === 'pre'
      ? `${firstOpen ? 'Iscrizioni aperte · ' : ''}Si parte ${start ? new Date(start).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }) : 'presto'}`
      : mode === 'post'
        ? 'Edizione conclusa · grazie a tutti'
        : `${tournaments.length} ${tournaments.length === 1 ? 'torneo' : 'tornei'} in programma`;

  const cta = !featured
    ? null
    : mode === 'post'
      ? { label: "Albo d'oro", to: `/${firstAlbo?.slug ?? featured.slug}/albo-d-oro` }
      : firstOpen
        ? { label: 'Iscrivi la tua squadra', to: `/${firstOpen.slug}/iscrizioni` }
        : mode === 'pre'
          ? { label: 'Iscrizioni', to: `/${featured.slug}/iscrizioni` }
          : { label: 'Punteggi & Risultati', to: `/${featured.slug}/risultati` };
  const cta2 = !featured
    ? null
    : mode === 'post'
      ? { label: 'Risultati finali', to: `/${featured.slug}/risultati` }
      : { label: 'Regolamento', to: `/${featured.slug}/regolamento` };

  const meta = [
    { label: 'Tornei', value: String(tournaments.length) },
    { label: 'Squadre', value: String(teamsCount) },
    { label: 'Luogo', value: home.place || featured?.data.info.location || '—' },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-12 px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
        <div className="flex min-w-0 flex-col gap-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-gradient-to-r from-primary to-cyan-500 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_0_20px_rgba(255,0,255,0.4)]">
              {home.badge}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">{progressShort}</span>
          </div>

          <h1 className="font-display text-[clamp(68px,10.5vw,168px)] uppercase leading-[0.86]">
            <span className="block text-white [text-shadow:0_0_14px_rgba(255,0,255,0.55),0_0_40px_rgba(0,255,255,0.25)]">
              {home.title1}
            </span>
            <span className="text-outline-neon block">{home.title2}</span>
          </h1>

          <p className="font-brush mt-2.5 origin-left -rotate-2 text-[clamp(40px,4.6vw,60px)] font-bold leading-none text-primary [text-shadow:0_0_18px_rgba(0,255,255,0.55),0_0_30px_rgba(255,0,255,0.3)]">
            {home.brush}
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] border-y border-white/10">
            {meta.map((m) => (
              <div key={m.label} className="flex flex-col gap-1 py-4 pr-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">{m.label}</span>
                <span className="text-base font-semibold text-white [text-wrap:pretty]">{m.value}</span>
              </div>
            ))}
          </div>

          {cta && cta2 && (
            <div className="flex flex-wrap gap-3.5">
              <Link to={cta.to} className="btn-neon px-[34px] py-4 text-lg">
                {cta.label} <span aria-hidden>→</span>
              </Link>
              <Link to={cta2.to} className="btn-ghost px-[30px] py-4 text-lg">
                {cta2.label}
              </Link>
            </div>
          )}
        </div>

        <div className="relative flex min-w-0 flex-col items-center justify-center">
          <div className="absolute inset-x-[12%] top-0 mx-auto aspect-square max-w-[380px] rounded-full bg-[radial-gradient(circle,rgba(255,0,255,0.28),rgba(0,255,255,0.12)_45%,transparent_70%)] blur-[30px]" />
          <div className="relative aspect-square w-[min(100%,380px)]">
            <img
              src="/logo.png"
              alt="Joga Bonito"
              className="h-full w-full animate-jb-float object-contain"
            />
          </div>
          {mode === 'pre' && <CountdownTimer target={start} />}
          {mode === 'live' && <NextMatchCard list={tournaments} />}
          {mode === 'post' && tournaments.length > 0 && <ChampionsCard list={tournaments} />}
        </div>
      </section>

      {/* I NOSTRI TORNEI */}
      <section className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 pb-24 pt-[72px] sm:px-6">
        <div>
          <h2 className="font-display text-[clamp(36px,4vw,52px)] uppercase leading-none text-white">I nostri tornei</h2>
          <p className="font-brush mt-1.5 text-[30px] text-primary">scegli il tuo campo</p>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Caricamento…</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : tournaments.length === 0 ? (
          <p className="text-sm text-zinc-500">Nessun torneo al momento. Torna a trovarci presto!</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-5">
            {tournaments.map((t) => (
              <TournamentCard key={t.slug} t={t} mode={mode} />
            ))}
          </div>
        )}

        {mode === 'post' && (
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-primary/[0.35] bg-[linear-gradient(135deg,rgba(255,0,255,0.1),rgba(0,255,255,0.06))] p-[clamp(24px,4vw,40px)]">
            <div>
              <span className="font-display text-[clamp(30px,3.6vw,46px)] uppercase leading-none text-white">
                Ci vediamo alla prossima edizione!
              </span>
              <p className="font-brush mt-2 text-[28px] text-cyan-400">foto, video e date nuove sui nostri social</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon px-6 py-3.5 text-[15px] shadow-none"
              >
                Instagram
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost border-white/20 px-6 py-3.5 text-[15px]"
              >
                TikTok
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
