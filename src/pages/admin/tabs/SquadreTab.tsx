import { Plus, Shuffle, Trash2 } from 'lucide-react';
import { useTournament } from '@/data/store';
import {
  computeStandings,
  GROUP_IDS,
  groupOfTeam,
  groupsOf,
  initials,
  newId,
  type GroupId,
  type Team,
} from '@/data/tournament';
import { cn } from '@/lib/utils';
import { Btn, Card, CardTitle, PillGroup, SelectInput, TextInput, useConfirm } from '../ui';

const groupOptions = [
  { id: '1', label: 'Unico' },
  { id: '2', label: '2 gironi' },
  { id: '3', label: '3 gironi' },
  { id: '4', label: '4 gironi' },
];

export default function SquadreTab() {
  const { data, update } = useTournament();
  const confirm = useConfirm();
  const groups = groupsOf(data);

  const patchTeam = (id: string, p: Partial<Team>) =>
    update((prev) => ({ ...prev, teams: prev.teams.map((t) => (t.id === id ? { ...t, ...p } : t)) }));

  const addTeam = () =>
    update((prev) => ({
      ...prev,
      teams: [...prev.teams, { id: newId('t'), name: `Squadra ${prev.teams.length + 1}`, group: 'A' }],
    }));

  const removeTeam = async (t: Team) => {
    const played = data.matches.filter((m) => m.home === t.id || m.away === t.id).length;
    const ok = await confirm({
      title: `Eliminare ${t.name}?`,
      message: played
        ? `La squadra ha ${played} ${played === 1 ? 'partita' : 'partite'} in calendario: verranno eliminate anche quelle.`
        : 'La squadra verrà tolta dal torneo.',
    });
    if (!ok) return;
    update((prev) => ({
      ...prev,
      teams: prev.teams.filter((x) => x.id !== t.id),
      matches: prev.matches.filter((m) => m.home !== t.id && m.away !== t.id),
    }));
  };

  /* distribuzione a serpentina sulla classifica: A B C D D C B A … */
  const distribute = () =>
    update((prev) => {
      const n = prev.groupCount;
      const order = computeStandings(prev.teams, prev.matches).map((r) => r.team.id);
      const groupOf = new Map<string, GroupId>();
      order.forEach((id, i) => {
        const round = Math.floor(i / n);
        const pos = i % n;
        groupOf.set(id, GROUP_IDS[round % 2 === 0 ? pos : n - 1 - pos]);
      });
      return { ...prev, teams: prev.teams.map((t) => ({ ...t, group: groupOf.get(t.id) ?? 'A' })) };
    });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardTitle
          aside={
            data.groupCount > 1 && (
              <Btn small onClick={distribute} disabled={data.teams.length < 2}>
                <Shuffle className="h-3.5 w-3.5" /> Distribuisci auto
              </Btn>
            )
          }
        >
          Gironi
        </CardTitle>
        <PillGroup
          value={String(data.groupCount)}
          options={groupOptions}
          onChange={(v) => update((prev) => ({ ...prev, groupCount: Number(v) }))}
          className="self-start"
        />
        <p className="mt-3 text-sm text-zinc-500">
          {data.groupCount === 1
            ? 'Girone unico: passano in semifinale le prime 4.'
            : data.groupCount === 2
              ? '2 gironi: semifinali 1ªA–2ªB e 1ªB–2ªA.'
              : data.groupCount === 3
                ? '3 gironi: semifinali 1ªA–miglior 2ª e 1ªB–1ªC.'
                : '4 gironi: semifinali 1ªA–1ªD e 1ªB–1ªC.'}
        </p>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-xl uppercase text-white">{data.teams.length} squadre</span>
        <Btn variant="primary" onClick={addTeam}>
          <Plus className="h-4 w-4" /> Aggiungi squadra
        </Btn>
      </div>

      {data.teams.length === 0 && (
        <div className="rounded-[14px] border border-dashed border-white/[0.12] p-10 text-center text-zinc-400">
          Nessuna squadra. Aggiungile a mano o approva le iscrizioni.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.teams.map((t) => {
          const g = groupOfTeam(data, t);
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-[14px] border border-white/[0.08] bg-[#101010] p-3">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-primary/[0.35] bg-primary/[0.12] font-display text-[13px] text-primary">
                {initials(t.name)}
              </span>
              <TextInput
                value={t.name}
                onChange={(e) => patchTeam(t.id, { name: e.target.value })}
                aria-label="Nome squadra"
                className="min-w-0 flex-1 px-3 py-2 font-display text-base font-normal uppercase"
              />
              {data.groupCount > 1 && (
                <SelectInput
                  value={g}
                  onChange={(e) => patchTeam(t.id, { group: e.target.value as GroupId })}
                  aria-label="Girone"
                  className={cn('w-16 shrink-0 px-2 py-2 text-center')}
                >
                  {groups.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </SelectInput>
              )}
              <button
                type="button"
                onClick={() => removeTeam(t)}
                aria-label={`Elimina ${t.name}`}
                className="shrink-0 rounded-full p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
