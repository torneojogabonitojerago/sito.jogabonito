import { Plus, Trash2 } from 'lucide-react';
import { useTournament } from '@/data/store';
import { tournamentYear, type HallOfFameEdition } from '@/data/tournament';
import { Btn, Card, Field, TextInput, useConfirm } from '../ui';

const fields: { key: keyof HallOfFameEdition; label: string }[] = [
  { key: 'winner', label: 'Campione' },
  { key: 'runnerUp', label: 'Finalista' },
  { key: 'thirdPlace', label: 'Terzo posto' },
  { key: 'mvp', label: 'MVP' },
  { key: 'topScorer', label: 'Capocannoniere' },
];

export default function AlboTab() {
  const { data, update } = useTournament();
  const confirm = useConfirm();
  const setEditions = (fn: (e: HallOfFameEdition[]) => HallOfFameEdition[]) =>
    update((prev) => ({ ...prev, hallOfFame: fn(prev.hallOfFame) }));

  const add = () => {
    const years = data.hallOfFame.map((e) => Number(e.year)).filter(Boolean);
    const year = String(years.length ? Math.max(...years) + 1 : tournamentYear(data));
    setEditions((eds) => [{ year, winner: '', runnerUp: '', thirdPlace: '' }, ...eds]);
  };

  const remove = async (i: number) => {
    const e = data.hallOfFame[i];
    if (await confirm({ title: `Eliminare l'edizione ${e.year}?` })) {
      setEditions((eds) => eds.filter((_, k) => k !== i));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-xl uppercase text-white">
          {data.hallOfFame.length} {data.hallOfFame.length === 1 ? 'edizione' : 'edizioni'}
        </span>
        <Btn variant="primary" onClick={add}>
          <Plus className="h-4 w-4" /> Aggiungi edizione
        </Btn>
      </div>
      {data.hallOfFame.length === 0 && (
        <div className="rounded-[14px] border border-dashed border-white/[0.12] p-10 text-center text-zinc-400">
          Nessuna edizione. "Chiudi e archivia" la aggiunge da sola con il podio.
        </div>
      )}
      {data.hallOfFame.map((e, i) => (
        <Card key={i} className="border-amber-500/25">
          <div className="grid gap-3 sm:grid-cols-[110px_repeat(2,minmax(0,1fr))] lg:grid-cols-[110px_repeat(5,minmax(0,1fr))_auto] lg:items-end">
            <Field label="Anno">
              <TextInput
                value={e.year}
                inputMode="numeric"
                onChange={(ev) => setEditions((eds) => eds.map((x, k) => (k === i ? { ...x, year: ev.target.value } : x)))}
                className="font-display text-lg text-amber-400"
              />
            </Field>
            {fields.map((f) => (
              <Field key={f.key} label={f.label}>
                <TextInput
                  value={String(e[f.key] ?? '')}
                  onChange={(ev) =>
                    setEditions((eds) => eds.map((x, k) => (k === i ? { ...x, [f.key]: ev.target.value } : x)))
                  }
                />
              </Field>
            ))}
            <Btn variant="danger" small onClick={() => remove(i)} aria-label={`Elimina edizione ${e.year}`} className="self-end">
              <Trash2 className="h-4 w-4" />
            </Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}
