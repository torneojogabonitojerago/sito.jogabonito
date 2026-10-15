import {
  byDateTime,
  formatDay,
  formatDayShort,
  groupLabel,
  groupOfTeam,
  groupsOf,
  groupStageDates,
  initials,
  semifinalProjection,
  setsWon,
  teamName,
  type Match,
  type Team,
} from '@/data/tournament';
import { useTournament } from '@/data/store';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

type StepState = 'done' | 'current' | 'next';

const stepStyle: Record<StepState, { tag: string; tagCls: string; box: string; dot: string }> = {
  done: { tag: 'Giocata', tagCls: 'text-zinc-500', box: 'border-white/[0.08] bg-[#101010]', dot: 'bg-cyan-400' },
  current: {
    tag: 'In corso',
    tagCls: 'text-primary',
    box: 'border-primary/[0.55] bg-[linear-gradient(160deg,rgba(255,0,255,0.16),rgba(0,255,255,0.06))]',
    dot: 'bg-primary shadow-[0_0_12px_#ff00ff]',
  },
  next: { tag: 'In arrivo', tagCls: 'text-zinc-600', box: 'border-white/[0.08] bg-[#101010]/50', dot: 'bg-zinc-800' },
};

const allDone = (list: Match[]) => list.length > 0 && list.every((m) => m.status === 'finished');

function MatchRow({ m, teams }: { m: Match; teams: Team[] }) {
  const sw = setsWon(m);
  const done = m.status === 'finished';
  const live = m.status === 'live';
  return (
    <div
      className={cn(
        'grid grid-cols-[48px_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-[10px] border bg-[#101010]/80 px-4 py-3 font-display text-base sm:grid-cols-[56px_minmax(0,1fr)_auto_minmax(0,1fr)]',
        live ? 'border-red-500/50' : 'border-white/[0.06]',
      )}
    >
      <span className={live ? 'text-red-400' : done ? 'text-zinc-500' : 'text-primary'}>{m.time}</span>
      <span className={cn('truncate uppercase', done && sw.away > sw.home ? 'text-zinc-500' : 'text-white')}>
        {teamName(teams, m, 'home')}
      </span>
      <span
        className={cn('min-w-[44px] text-center', live ? 'text-red-400' : done ? 'text-white' : 'text-zinc-600')}
      >
        {done || live ? `${sw.home} – ${sw.away}` : 'VS'}
      </span>
      <span
        className={cn('truncate text-right uppercase', done && sw.home > sw.away ? 'text-zinc-500' : 'text-white')}
      >
        {teamName(teams, m, 'away')}
      </span>
    </div>
  );
}

export default function Gironi() {
  const { data } = useTournament();
  const { teams, matches } = data;

  const dates = groupStageDates(matches);
  const groupMatches = matches.filter((m) => m.phase === 'gironi');
  const curDay = dates.find((d) => groupMatches.some((m) => m.date === d && m.status !== 'finished'));
  const groupsOver = dates.length > 0 && !curDay;

  const semis = matches.filter((m) => m.phase === 'semifinale').sort(byDateTime);
  const finalina = matches.find((m) => m.phase === 'finalina');
  const finale = matches.find((m) => m.phase === 'finale');
  const finals = matches.filter((m) => m.phase !== 'gironi').sort(byDateTime);

  /* riga di step: giornate, semifinali, finale */
  const steps: { title: string; date: string; state: StepState }[] = [
    ...dates.map((d, i) => ({
      title: `Giornata ${i + 1}`,
      date: formatDayShort(d),
      state: (allDone(groupMatches.filter((m) => m.date === d)) ? 'done' : d === curDay ? 'current' : 'next') as StepState,
    })),
    {
      title: 'Semifinali',
      date: semis[0] ? formatDayShort(semis[0].date) : '—',
      state: allDone(semis) ? 'done' : groupsOver ? 'current' : 'next',
    },
    {
      title: 'Finale',
      date: finale ? formatDayShort(finale.date) : '—',
      state: finale?.status === 'finished' ? 'done' : groupsOver && allDone(semis) ? 'current' : 'next',
    },
  ];

  /* semifinali: squadre reali se assegnate, altrimenti proiezione dalla classifica */
  const projected = groupMatches.some((m) => m.status === 'finished');
  const projection = semifinalProjection(data);
  const groups = groupsOf(data);
  const semiCards = [0, 1].map((i) => {
    const m = semis[i];
    const side = (s: 'home' | 'away', j: 0 | 1) =>
      m?.[s] ? [teamName(teams, m, s), ''] : projection[i][j];
    const [home, homeLabel] = side('home', 0);
    const [away, awayLabel] = side('away', 1);
    return { code: `SF${i + 1}`, when: m ? `${formatDay(m.date)} · ${m.time}` : '', home, homeLabel, away, awayLabel };
  });

  const finalsRange =
    finals.length === 0
      ? ''
      : finals[0].date === finals[finals.length - 1].date
        ? formatDay(finals[0].date)
        : `${formatDayShort(finals[0].date)} – ${formatDayShort(finals[finals.length - 1].date)}`;

  return (
    <div>
      <PageHeader
        title="Gironi"
        brush="calendario e cammino"
        aside={`${groups.length === 1 ? 'Girone unico' : `${groups.length} gironi`} · ${teams.length} squadre`}
      />

      <section className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 pb-24 sm:px-6">
        {/* step */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {steps.map((s) => {
            const st = stepStyle[s.state];
            return (
              <div key={s.title} className={cn('flex min-h-[118px] flex-col gap-2.5 rounded-[14px] border p-5', st.box)}>
                <div className="flex items-center justify-between">
                  <span className={cn('font-display text-[13px] uppercase tracking-[0.18em]', st.tagCls)}>{st.tag}</span>
                  <span className={cn('h-2.5 w-2.5 rounded-full', st.dot)} />
                </div>
                <span className="font-display text-[26px] uppercase leading-none text-white">{s.title}</span>
                <span className="mt-auto text-sm font-semibold uppercase tracking-[0.08em] text-zinc-400">{s.date}</span>
              </div>
            );
          })}
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-3">
          {/* gironi */}
          <div className="flex flex-col gap-4">
            {groups.map((g) => {
              const list = teams.filter((t) => groupOfTeam(data, t) === g);
              return (
                <div key={g} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101010]">
                  <div className="flex items-baseline justify-between border-b-2 border-primary px-6 py-5">
                    <span className="font-display text-[26px] uppercase text-white">{groupLabel(data, g)}</span>
                    <span className="label-xs">{list.length} squadre</span>
                  </div>
                  {list.length === 0 && <p className="px-6 py-5 text-sm text-zinc-500">Squadre in arrivo.</p>}
                  {list.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3.5 border-t border-white/5 px-6 py-[13px] first-of-type:border-t-0"
                    >
                      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-primary/[0.35] bg-primary/[0.12] font-display text-[13px] text-primary">
                        {initials(t.name)}
                      </span>
                      <span className="font-display text-lg uppercase text-white">{t.name}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* calendario per giornata */}
          <div className="flex min-w-0 flex-col gap-8 lg:col-span-2">
            {dates.length === 0 && (
              <div className="rounded-[14px] border border-dashed border-white/[0.12] p-10 text-center text-zinc-400">
                Calendario in arrivo.
              </div>
            )}
            {dates.map((d, i) => (
              <div key={d} className="flex flex-col gap-2.5">
                <div className="flex items-baseline gap-3.5 border-b border-white/[0.08] pb-2.5">
                  <span className="font-display text-[26px] uppercase text-white">Giornata {i + 1}</span>
                  <span
                    className={cn(
                      'text-xs font-bold uppercase tracking-[0.2em]',
                      d === curDay ? 'text-primary' : 'text-zinc-500',
                    )}
                  >
                    {formatDay(d)}
                  </span>
                </div>
                {groupMatches
                  .filter((m) => m.date === d)
                  .sort(byDateTime)
                  .map((m) => (
                    <MatchRow key={m.id} m={m} teams={teams} />
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* fasi finali */}
        {finals.length > 0 && (
          <div className="flex flex-col gap-7 rounded-[20px] border border-primary/30 bg-[linear-gradient(135deg,rgba(0,0,0,0.8),rgba(255,0,255,0.07)_60%,rgba(0,255,255,0.06))] p-[clamp(20px,4vw,44px)]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-[clamp(34px,4vw,48px)] uppercase leading-none text-white">Fasi finali</h2>
                <p className="font-brush mt-1 text-[28px] text-cyan-400">
                  {projected ? 'proiezione sulla classifica attuale' : 'chi passa il turno'}
                </p>
              </div>
              {finalsRange && (
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">{finalsRange}</span>
              )}
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-center gap-5">
              <div className="flex flex-col gap-3.5">
                {semiCards.map((s) => (
                  <div key={s.code} className="overflow-hidden rounded-[14px] border border-white/10 bg-[#0d0d0d]">
                    <div className="flex justify-between bg-white/[0.03] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      <span className="text-primary">{s.code}</span>
                      <span>{s.when}</span>
                    </div>
                    <div className="flex justify-between gap-2.5 border-b border-white/5 px-4 py-3">
                      <span className="font-display text-lg uppercase text-white">{s.home}</span>
                      <span className="text-[11px] font-bold tracking-[0.14em] text-zinc-500">{s.homeLabel}</span>
                    </div>
                    <div className="flex justify-between gap-2.5 px-4 py-3">
                      <span className="font-display text-lg uppercase text-white">{s.away}</span>
                      <span className="text-[11px] font-bold tracking-[0.14em] text-zinc-500">{s.awayLabel}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-3 rounded-[18px] border border-primary/[0.55] bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,255,0.2),rgba(0,0,0,0.9)_70%)] px-6 py-8 text-center shadow-[0_0_60px_rgba(255,0,255,0.25)]">
                <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-400">
                  {finale ? `${formatDay(finale.date)} · ${finale.time}` : 'Data da definire'}
                </span>
                <span className="font-display text-[clamp(52px,6vw,76px)] uppercase leading-[0.9] text-white [text-shadow:0_0_14px_rgba(255,0,255,0.65),0_0_35px_rgba(0,255,255,0.35)]">
                  Finale
                </span>
                <span className="font-brush text-[28px] text-primary">
                  {finale
                    ? `${teamName(teams, finale, 'home')} vs ${teamName(teams, finale, 'away')}`
                    : 'Vincente SF1 vs Vincente SF2'}
                </span>
                {finalina && (
                  <span className="mt-1.5 rounded-full border border-white/[0.12] px-4 py-[9px] text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                    Finalina 3°/4° · ore {finalina.time}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
