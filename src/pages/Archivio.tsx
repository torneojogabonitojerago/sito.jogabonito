import { Link, useParams } from 'react-router';
import PageHeader from '@/components/PageHeader';
import { useTournamentsRegistry } from '@/data/tournaments-registry';
import {
  byDateTime,
  championOf,
  computeStandings,
  groupStageDates,
  isDefined,
  podiumOf,
  setsWon,
  teamName,
  tournamentYear,
  type Match,
  type TournamentData,
} from '@/data/tournament';
import { cn } from '@/lib/utils';

const posColor = (i: number) =>
  i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-200' : i === 2 ? 'text-amber-600' : 'text-zinc-500';

function runnerUpOf(d: TournamentData): string {
  const ed = d.hallOfFame.find((e) => e.year === tournamentYear(d) && isDefined(e.runnerUp));
  return ed?.runnerUp ?? podiumOf(d)[1];
}

const infoOf = (d: TournamentData) => [d.info.dates, d.info.location].filter(Boolean).join(' · ');

function ArchiveList() {
  const { archived, loading } = useTournamentsRegistry();

  if (loading) return <p className="text-sm text-zinc-500">Caricamento…</p>;

  if (archived.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[18px] border border-dashed border-white/[0.14] px-6 py-12 text-center">
        <span className="font-display text-[28px] uppercase text-white">Archivio vuoto</span>
        <span className="max-w-[48ch] text-[15px] leading-normal text-zinc-400">
          Quando un torneo finisce, gli organizzatori lo archiviano qui con classifica e risultati finali.
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-5">
      {archived.map(({ slug, data: d }) => (
        <Link
          key={slug}
          to={`/archivio/${slug}`}
          className="flex flex-col gap-4 rounded-[18px] border border-amber-500/30 bg-[linear-gradient(160deg,#100c04,#0a0a0a_65%)] p-7 text-white transition-[border-color,box-shadow] hover:border-amber-400 hover:shadow-[0_10px_40px_rgba(245,158,11,0.15)]"
        >
          <div className="flex w-full items-baseline justify-between gap-3">
            <span className="font-display text-[44px] leading-none text-amber-400 [text-shadow:0_0_24px_rgba(245,158,11,0.35)]">
              {tournamentYear(d)}
            </span>
            <span className="label-xs">{d.matches.filter((m) => m.status === 'finished').length} partite</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display text-[26px] uppercase leading-[1.05]">{d.info.name}</span>
            <span className="text-sm font-semibold text-zinc-400">{infoOf(d)}</span>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 border-t border-white/[0.08] pt-3.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">Campione</span>
              <span className="truncate font-display text-lg uppercase">{championOf(d)}</span>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="label-xs">Finalista</span>
              <span className="truncate font-display text-lg uppercase text-zinc-300">{runnerUpOf(d)}</span>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Apri l'edizione →</span>
        </Link>
      ))}
    </div>
  );
}

function resultTag(m: Match, dates: string[]): string {
  if (m.phase === 'semifinale') return 'Semifinale';
  if (m.phase === 'finalina') return '3°/4° posto';
  if (m.phase === 'finale') return 'Finale';
  return `Giornata ${dates.indexOf(m.date) + 1}`;
}

function ArchiveDetail({ slug }: { slug: string }) {
  const { archived, loading } = useTournamentsRegistry();
  const t = archived.find((x) => x.slug === slug);

  if (loading) return <p className="text-sm text-zinc-500">Caricamento…</p>;
  if (!t) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-zinc-400">Edizione non trovata nell'archivio.</p>
        <Link to="/archivio" className="btn-ghost px-5 py-3 text-sm">
          ← Tutte le edizioni
        </Link>
      </div>
    );
  }

  const d = t.data;
  const [first, second, third] = podiumOf(d);
  const champion = championOf(d);
  const podium = [
    {
      pos: '2°',
      name: second,
      label: 'Finalista',
      cls: 'min-h-[150px] border-zinc-400/30 bg-white/[0.04]',
      color: 'text-zinc-200',
    },
    {
      pos: '1°',
      name: isDefined(champion) ? champion : first,
      label: 'Campione',
      cls: 'min-h-[200px] border-amber-500/50 bg-[linear-gradient(180deg,rgba(245,158,11,0.18),rgba(0,0,0,0.6))] shadow-[0_0_50px_rgba(245,158,11,0.2)]',
      color: 'text-amber-400',
    },
    {
      pos: '3°',
      name: third,
      label: 'Terzo posto',
      cls: 'min-h-[120px] border-amber-700/40 bg-amber-700/[0.06]',
      color: 'text-amber-600',
    },
  ];
  const rows = computeStandings(d.teams, d.matches);
  const dates = groupStageDates(d.matches);
  const results = d.matches.filter((m) => m.status === 'finished').sort(byDateTime);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Link
            to="/archivio"
            className="self-start text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary"
          >
            ← Tutte le edizioni
          </Link>
          <span className="font-display text-[clamp(36px,4.4vw,56px)] uppercase leading-none text-white">
            {d.info.name}
          </span>
          <span className="text-[15px] font-semibold text-zinc-400">{infoOf(d)}</span>
        </div>
        <span className="rounded-full bg-amber-500/[0.12] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
          Archiviato · solo lettura
        </span>
      </div>

      <div className="grid grid-cols-3 items-end gap-3">
        {podium.map((p) => (
          <div
            key={p.pos}
            className={cn(
              'flex flex-col items-center justify-end gap-2 rounded-b-md rounded-t-2xl border px-3 py-5 text-center',
              p.cls,
            )}
          >
            <span className={cn('font-display text-[34px] leading-none', p.color)}>{p.pos}</span>
            <span className="font-display text-[clamp(16px,2vw,24px)] uppercase leading-[1.1] text-white [text-wrap:balance]">
              {p.name}
            </span>
            <span className="label-xs">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[1_1_420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101010]">
          <div className="border-b-2 border-amber-400 px-[22px] py-4 font-display text-[22px] uppercase text-white">
            Classifica finale
          </div>
          {rows.map((r, i) => (
            <div
              key={r.team.id}
              className="grid grid-cols-[40px_minmax(0,1fr)_44px_64px] items-center gap-2.5 border-t border-white/5 px-[22px] py-3 first-of-type:border-t-0"
            >
              <span className={cn('font-display text-lg', posColor(i))}>{i + 1}</span>
              <span className="truncate font-display text-[17px] uppercase text-white">{r.team.name}</span>
              <span className="text-right font-display text-lg text-primary">{r.points}</span>
              <span className="text-right text-[13px] font-semibold text-zinc-400">
                {r.won}V · {r.lost}P
              </span>
            </div>
          ))}
        </div>

        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-2">
          <span className="mb-1 font-display text-[22px] uppercase text-white">Risultati</span>
          {results.length === 0 && <p className="text-sm text-zinc-500">Nessuna partita giocata.</p>}
          {results.map((m) => {
            const sw = setsWon(m);
            return (
              <div
                key={m.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-white/[0.06] bg-[#101010]/80 px-4 py-3"
              >
                <span
                  className={cn(
                    'truncate font-display text-[15px] uppercase',
                    sw.away > sw.home ? 'text-zinc-500' : 'text-white',
                  )}
                >
                  {teamName(d.teams, m, 'home')}
                </span>
                <span className="flex flex-col items-center">
                  <span className="font-display text-xl leading-none text-white">
                    {sw.home}–{sw.away}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    {resultTag(m, dates)}
                  </span>
                </span>
                <span
                  className={cn(
                    'truncate text-right font-display text-[15px] uppercase',
                    sw.home > sw.away ? 'text-zinc-500' : 'text-white',
                  )}
                >
                  {teamName(d.teams, m, 'away')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Archivio() {
  const { slug } = useParams<{ slug: string }>();
  const { archived } = useTournamentsRegistry();

  return (
    <div>
      <PageHeader
        title="Archivio"
        brush="le edizioni passate"
        aside={`${archived.length} ${archived.length === 1 ? 'torneo archiviato' : 'tornei archiviati'}`}
      />
      <section className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 pb-24 sm:px-6">
        {slug ? <ArchiveDetail slug={slug} /> : <ArchiveList />}
      </section>
    </div>
  );
}
