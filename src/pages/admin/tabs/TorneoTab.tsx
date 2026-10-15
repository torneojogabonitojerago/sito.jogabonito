import { useState } from 'react';
import { ArrowDown, ArrowUp, Archive, CopyPlus, Plus, Trash2 } from 'lucide-react';
import { useTournament } from '@/data/store';
import { podiumOf, type TournamentInfo } from '@/data/tournament';
import { cn } from '@/lib/utils';
import { Btn, Card, CardTitle, Field, TextArea, TextInput } from '../ui';

interface Props {
  /** si può archiviare solo se resta almeno un altro torneo attivo */
  canArchive: boolean;
  onArchive: () => void;
  onNewEdition: () => void;
  onDelete: () => void;
}

export default function TorneoTab({ canArchive, onArchive, onNewEdition, onDelete }: Props) {
  const { data, update } = useTournament();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const info = data.info;
  const setInfo = (p: Partial<TournamentInfo>) => update((prev) => ({ ...prev, info: { ...prev.info, ...p } }));
  const setRules = (fn: (r: typeof data.rules) => typeof data.rules) =>
    update((prev) => ({ ...prev, rules: fn(prev.rules) }));
  const [first, second, third] = podiumOf(data);

  const moveRule = (i: number, dir: -1 | 1) =>
    setRules((rules) => {
      const out = [...rules];
      const [x] = out.splice(i, 1);
      out.splice(i + dir, 0, x);
      return out;
    });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardTitle>Dati del torneo</CardTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome">
            <TextInput value={info.name} onChange={(e) => setInfo({ name: e.target.value })} />
          </Field>
          <Field label="Edizione">
            <TextInput value={info.edition} onChange={(e) => setInfo({ edition: e.target.value })} placeholder="I Edizione" />
          </Field>
          <Field label="Scritta a mano">
            <TextInput
              value={info.brushSubtitle}
              onChange={(e) => setInfo({ brushSubtitle: e.target.value })}
              placeholder="Calcio Tennis 2026"
            />
          </Field>
          <Field label="Sport">
            <TextInput
              value={data.sport}
              onChange={(e) => update((prev) => ({ ...prev, sport: e.target.value }))}
              placeholder="Calcio tennis"
            />
          </Field>
          <Field label="Date">
            <TextInput value={info.dates} onChange={(e) => setInfo({ dates: e.target.value })} placeholder="24 Luglio — 2 Agosto 2026" />
          </Field>
          <Field label="Luogo">
            <TextInput value={info.location} onChange={(e) => setInfo({ location: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle
          aside={
            <Btn small onClick={() => setRules((rules) => [...rules, { title: 'Nuova regola', text: '' }])}>
              <Plus className="h-3.5 w-3.5" /> Aggiungi regola
            </Btn>
          }
        >
          Regolamento
        </CardTitle>
        <div className="flex flex-col gap-3">
          {data.rules.length === 0 && <p className="text-sm text-zinc-500">Nessuna regola.</p>}
          {data.rules.map((r, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-white/[0.08] bg-[#0d0d0d] p-3">
              <span className="w-9 shrink-0 font-display text-2xl text-primary">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <TextInput
                  value={r.title}
                  aria-label="Titolo regola"
                  onChange={(e) => setRules((rules) => rules.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))}
                />
                <TextArea
                  rows={2}
                  value={r.text}
                  aria-label="Testo regola"
                  onChange={(e) => setRules((rules) => rules.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                {[
                  { icon: ArrowUp, label: 'Sposta su', onClick: () => moveRule(i, -1), disabled: i === 0 },
                  { icon: ArrowDown, label: 'Sposta giù', onClick: () => moveRule(i, 1), disabled: i === data.rules.length - 1 },
                  { icon: Trash2, label: 'Elimina regola', onClick: () => setRules((rules) => rules.filter((_, k) => k !== i)) },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={b.onClick}
                    disabled={b.disabled}
                    aria-label={b.label}
                    className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                  >
                    <b.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-amber-500/30">
        <CardTitle>Fine torneo</CardTitle>
        <div className="grid grid-cols-3 items-end gap-2.5">
          {[
            { pos: '2°', name: second, h: 'min-h-[90px]', c: 'text-zinc-200' },
            { pos: '1°', name: first, h: 'min-h-[120px] border-amber-500/50 bg-amber-500/[0.08]', c: 'text-amber-400' },
            { pos: '3°', name: third, h: 'min-h-[76px]', c: 'text-amber-600' },
          ].map((p) => (
            <div
              key={p.pos}
              className={cn(
                'flex flex-col items-center justify-end gap-1 rounded-b-md rounded-t-xl border border-white/10 px-2 py-3 text-center',
                p.h,
              )}
            >
              <span className={cn('font-display text-2xl leading-none', p.c)}>{p.pos}</span>
              <span className="font-display text-sm uppercase leading-tight text-white">{p.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          Il podio viene da finale e finalina; se mancano, dalla classifica dei gironi.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {confirmArchive ? (
            <>
              <span className="text-sm font-semibold text-amber-400">
                Il podio va nell'albo d'oro, i moduli si chiudono e il torneo passa in archivio.
              </span>
              <Btn
                className="border-transparent bg-amber-500 text-black hover:bg-amber-400"
                onClick={() => {
                  setConfirmArchive(false);
                  onArchive();
                }}
              >
                Conferma
              </Btn>
              <Btn onClick={() => setConfirmArchive(false)}>Annulla</Btn>
            </>
          ) : (
            <>
              <Btn
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                onClick={() => setConfirmArchive(true)}
                disabled={!canArchive}
              >
                <Archive className="h-4 w-4" /> Chiudi e archivia
              </Btn>
              <Btn onClick={onNewEdition}>
                <CopyPlus className="h-4 w-4" /> Nuova edizione
              </Btn>
            </>
          )}
        </div>
        {!canArchive && (
          <p className="mt-2 text-xs text-zinc-500">Per archiviare serve almeno un altro torneo attivo.</p>
        )}
      </Card>

      <Card className="border-red-500/25 bg-red-500/[0.03]">
        <CardTitle>Elimina torneo</CardTitle>
        <p className="mb-4 text-sm text-zinc-400">Cancella definitivamente squadre, partite, moduli e albo di questo torneo.</p>
        <Btn variant="danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4" /> Elimina torneo
        </Btn>
      </Card>
    </div>
  );
}
