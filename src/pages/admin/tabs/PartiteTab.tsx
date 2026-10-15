import { useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useTournament } from '@/data/store';
import {
  byDateTime,
  formatDay,
  groupOfTeam,
  groupsOf,
  groupStageDates,
  newId,
  phaseLabel,
  setsWon,
  teamName,
  type GroupId,
  type Match,
  type MatchPhase,
  type MatchStatus,
  type SetScore,
} from '@/data/tournament';
import { cn } from '@/lib/utils';
import { Btn, Field, Modal, PillGroup, SelectInput, TextArea, TextInput, inputCls, useConfirm } from '../ui';

const phases: { id: MatchPhase; label: string }[] = [
  { id: 'gironi', label: 'Girone' },
  { id: 'semifinale', label: 'Semifinale' },
  { id: 'finalina', label: 'Finalina' },
  { id: 'finale', label: 'Finale' },
];

const statuses: { id: MatchStatus; label: string; on: string }[] = [
  { id: 'scheduled', label: 'Da giocare', on: 'bg-zinc-400 text-[#0a0a0a]' },
  { id: 'live', label: 'Live', on: 'bg-red-400 text-[#0a0a0a]' },
  { id: 'finished', label: 'Finita', on: 'bg-cyan-400 text-[#0a0a0a]' },
];

const shortPhase: Record<MatchPhase, string> = { gironi: '', semifinale: 'SF', finalina: '3°/4°', finale: 'Finale' };

const defaultLabels: Record<MatchPhase, [string, string]> = {
  gironi: ['', ''],
  semifinale: ['1ª Classificata', '4ª Classificata'],
  finalina: ['Perdente SF1', 'Perdente SF2'],
  finale: ['Vincente SF1', 'Vincente SF2'],
};

/** Set sempre lunghi 3 in modifica; si tolgono quelli finali vuoti (0-0) al salvataggio. */
const padSets = (sets: SetScore[]): SetScore[] => [0, 1, 2].map((i) => sets[i] ?? { home: 0, away: 0 });
const trimSets = (sets: SetScore[]): SetScore[] => {
  const out = [...sets];
  while (out.length && out[out.length - 1].home === 0 && out[out.length - 1].away === 0) out.pop();
  return out;
};
const setValue = (s: SetScore, side: 'home' | 'away') =>
  s.home === 0 && s.away === 0 ? '' : String(s[side]);

/* ---------- finestra aggiungi / modifica ---------- */

interface Draft {
  phase: MatchPhase;
  date: string;
  time: string;
  field: string;
  home: string;
  away: string;
  homeLabel: string;
  awayLabel: string;
  status: MatchStatus;
  sets: SetScore[];
  note: string;
}

function draftOf(m: Match | null, fallbackDate: string, teamIds: string[]): Draft {
  if (m) {
    return {
      phase: m.phase,
      date: m.date,
      time: m.time,
      field: m.field ?? '',
      home: m.home,
      away: m.away,
      homeLabel: m.homeLabel ?? '',
      awayLabel: m.awayLabel ?? '',
      status: m.status,
      sets: padSets(m.sets),
      note: m.note ?? '',
    };
  }
  return {
    phase: 'gironi',
    date: fallbackDate,
    time: '',
    field: 'Campo centrale',
    home: teamIds[0] ?? '',
    away: teamIds[1] ?? '',
    homeLabel: '',
    awayLabel: '',
    status: 'scheduled',
    sets: padSets([]),
    note: '',
  };
}

function MatchModal({ match, onClose }: { match: Match | null | 'new'; onClose: () => void }) {
  const { data, update } = useTournament();
  const editing = match && match !== 'new' ? match : null;
  const lastDate = [...data.matches].sort(byDateTime).at(-1)?.date ?? new Date().toISOString().slice(0, 10);
  const [d, setD] = useState<Draft>(() => draftOf(editing, lastDate, data.teams.map((t) => t.id)));
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<Draft>) => {
    setD((prev) => ({ ...prev, ...p }));
    setError(null);
  };
  const knockout = d.phase !== 'gironi';

  const save = () => {
    if (!d.date || !d.time) return setError('Inserisci data e ora.');
    if (!knockout && (!d.home || !d.away)) return setError('Scegli entrambe le squadre.');
    if (d.home && d.home === d.away) return setError('Una squadra non può giocare contro se stessa.');

    const [defHome, defAway] = defaultLabels[d.phase];
    const home = data.teams.find((t) => t.id === d.home);
    const next: Match = {
      id: editing?.id ?? newId('m'),
      date: d.date,
      time: d.time,
      phase: d.phase,
      group: !knockout && home ? groupOfTeam(data, home) : undefined,
      home: d.home,
      away: d.away,
      homeLabel: knockout && !d.home ? d.homeLabel || defHome : undefined,
      awayLabel: knockout && !d.away ? d.awayLabel || defAway : undefined,
      status: d.status,
      sets: d.status === 'scheduled' ? [] : trimSets(d.sets),
      field: d.field.trim() || undefined,
      note: d.note.trim() || undefined,
    };
    update((prev) => ({
      ...prev,
      matches: editing ? prev.matches.map((m) => (m.id === editing.id ? next : m)) : [...prev.matches, next],
    }));
    onClose();
  };

  const teamSelect = (side: 'home' | 'away') => (
    <SelectInput value={d[side]} onChange={(e) => set({ [side]: e.target.value })}>
      {knockout && <option value="">— Da definire —</option>}
      {!knockout && !d[side] && <option value="">Scegli…</option>}
      {data.teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </SelectInput>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? 'Modifica partita' : 'Aggiungi partita'}
      wide
      footer={
        <>
          <Btn onClick={onClose}>Annulla</Btn>
          <Btn variant="primary" onClick={save}>
            {editing ? 'Salva' : 'Aggiungi'}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Fase">
          <PillGroup value={d.phase} options={phases} onChange={(phase) => set({ phase })} className="self-start" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Data">
            <TextInput type="date" value={d.date} onChange={(e) => set({ date: e.target.value })} />
          </Field>
          <Field label="Ora">
            <TextInput type="time" value={d.time} onChange={(e) => set({ time: e.target.value })} />
          </Field>
          <Field label="Campo">
            <TextInput value={d.field} onChange={(e) => set({ field: e.target.value })} placeholder="Campo centrale" />
          </Field>
        </div>
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <Field label="Casa">{teamSelect('home')}</Field>
          <span className="pb-3 text-center font-display text-lg text-primary">VS</span>
          <Field label="Ospite">{teamSelect('away')}</Field>
        </div>
        {knockout && (!d.home || !d.away) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {!d.home && (
              <Field label="Etichetta casa">
                <TextInput
                  value={d.homeLabel}
                  onChange={(e) => set({ homeLabel: e.target.value })}
                  placeholder={defaultLabels[d.phase][0]}
                />
              </Field>
            )}
            {!d.away && (
              <Field label="Etichetta ospite" className={!d.home ? '' : 'sm:col-start-2'}>
                <TextInput
                  value={d.awayLabel}
                  onChange={(e) => set({ awayLabel: e.target.value })}
                  placeholder={defaultLabels[d.phase][1]}
                />
              </Field>
            )}
          </div>
        )}
        <Field label="Stato">
          <PillGroup
            value={d.status}
            options={statuses.map((s) => ({ id: s.id, label: s.label }))}
            onChange={(status) => set({ status })}
            className="self-start"
          />
        </Field>
        {d.status !== 'scheduled' && (
          <div className="grid gap-2">
            <span className="label-xs">Punteggi dei set (casa – ospite)</span>
            <div className="grid grid-cols-3 gap-2">
              {d.sets.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {(['home', 'away'] as const).map((side, j) => (
                    <span key={side} className="contents">
                      {j === 1 && <span className="text-zinc-600">–</span>}
                      <input
                        inputMode="numeric"
                        aria-label={`Set ${i + 1} ${side === 'home' ? 'casa' : 'ospite'}`}
                        value={setValue(s, side)}
                        onChange={(e) => {
                          const v = Number(e.target.value.replace(/\D/g, '').slice(0, 2)) || 0;
                          set({ sets: d.sets.map((x, k) => (k === i ? { ...x, [side]: v } : x)) });
                        }}
                        className={cn(inputCls, 'w-full px-2 text-center')}
                      />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        <Field label="Note">
          <TextArea rows={2} value={d.note} onChange={(e) => set({ note: e.target.value })} />
        </Field>
        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

/* ---------- card partita ---------- */

function AdminMatchCard({ m, onEdit }: { m: Match; onEdit: () => void }) {
  const { data, update } = useTournament();
  const confirm = useConfirm();
  const sw = setsWon(m);
  const done = m.status === 'finished';
  const sets = padSets(m.sets);
  const home = data.teams.find((t) => t.id === m.home);
  const tag =
    m.phase !== 'gironi' ? shortPhase[m.phase] : data.groupCount > 1 && home ? `Gir. ${groupOfTeam(data, home)}` : '';

  const patch = (p: Partial<Match>) =>
    update((prev) => ({ ...prev, matches: prev.matches.map((x) => (x.id === m.id ? { ...x, ...p } : x)) }));

  const setSet = (i: number, side: 'home' | 'away', raw: string) => {
    const v = Number(raw.replace(/\D/g, '').slice(0, 2)) || 0;
    const next = sets.map((s, k) => (k === i ? { ...s, [side]: v } : s));
    // inserire un punteggio su una partita "da giocare" la mette in corso
    patch({ sets: trimSets(next), status: m.status === 'scheduled' ? 'live' : m.status });
  };

  const remove = async () => {
    const ok = await confirm({
      title: 'Eliminare la partita?',
      message: `${teamName(data.teams, m, 'home')} – ${teamName(data.teams, m, 'away')} verrà tolta dal calendario.`,
    });
    if (ok) update((prev) => ({ ...prev, matches: prev.matches.filter((x) => x.id !== m.id) }));
  };

  const teamRow = (side: 'home' | 'away') => {
    const lost = done && (side === 'home' ? sw.away > sw.home : sw.home > sw.away);
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,44px)] items-center gap-1.5">
        <span className={cn('truncate font-display text-base uppercase', lost ? 'text-zinc-500' : 'text-white')}>
          {teamName(data.teams, m, side)}
        </span>
        {sets.map((s, i) => (
          <input
            key={i}
            inputMode="numeric"
            aria-label={`Set ${i + 1} ${side === 'home' ? 'casa' : 'ospite'}`}
            value={setValue(s, side)}
            onChange={(e) => setSet(i, side, e.target.value)}
            className="h-10 w-11 rounded-lg border border-white/[0.12] bg-[#0a0a0a] text-center font-display text-base text-white outline-none focus:border-primary"
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[14px] border bg-[#101010] p-4',
        m.status === 'live' ? 'border-red-500/50' : 'border-white/[0.08]',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
          <span className="font-display text-base tracking-normal text-primary">{m.time}</span>
          {tag && <span className="rounded-md bg-primary/[0.12] px-2 py-0.5 text-[11px] text-primary">{tag}</span>}
          {m.field && <span className="text-zinc-600">· {m.field}</span>}
        </span>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => patch({ status: s.id })}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors',
                m.status === s.id ? s.on : 'text-zinc-500 hover:text-white',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {teamRow('home')}
      {teamRow('away')}
      {m.note && <p className="text-xs text-zinc-500">{m.note}</p>}
      <div className="flex justify-end gap-1">
        <Btn variant="quiet" small onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" /> Modifica
        </Btn>
        <Btn variant="quiet" small onClick={remove} className="hover:text-red-400">
          <Trash2 className="h-3.5 w-3.5" /> Elimina
        </Btn>
      </div>
    </div>
  );
}

/* ---------- scheda ---------- */

interface Filters {
  q: string;
  day: string;
  phase: 'all' | MatchPhase;
  group: 'all' | GroupId;
  status: 'all' | MatchStatus;
}

const noFilters: Filters = { q: '', day: 'all', phase: 'all', group: 'all', status: 'all' };

export default function PartiteTab() {
  const { data } = useTournament();
  const [f, setF] = useState<Filters>(noFilters);
  const [editing, setEditing] = useState<Match | 'new' | null>(null);

  const groupDates = groupStageDates(data.matches);
  const allDates = [...new Set(data.matches.map((m) => m.date))].sort();
  const dayLabel = (date: string) => {
    const i = groupDates.indexOf(date);
    return i >= 0 ? `Giornata ${i + 1} · ${formatDay(date)}` : formatDay(date);
  };

  const teamGroup = (id: string) => {
    const t = data.teams.find((x) => x.id === id);
    return t ? groupOfTeam(data, t) : undefined;
  };

  // tutti i filtri tranne lo stato: i contatori dei chip di stato ne tengono conto
  const q = f.q.trim().toLowerCase();
  const base = data.matches.filter(
    (m) =>
      (f.day === 'all' || m.date === f.day) &&
      (f.phase === 'all' || m.phase === f.phase) &&
      (f.group === 'all' || teamGroup(m.home) === f.group || teamGroup(m.away) === f.group) &&
      (!q || `${teamName(data.teams, m, 'home')} ${teamName(data.teams, m, 'away')}`.toLowerCase().includes(q)),
  );
  const list = base.filter((m) => f.status === 'all' || m.status === f.status).sort(byDateTime);
  const days = [...new Set(list.map((m) => m.date))];
  const filtered = JSON.stringify(f) !== JSON.stringify(noFilters);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Btn variant="primary" onClick={() => setEditing('new')} disabled={data.teams.length < 2}>
          <Plus className="h-4 w-4" /> Aggiungi partita
        </Btn>
        {data.teams.length < 2 && (
          <span className="text-sm text-zinc-500">Aggiungi almeno due squadre per creare le partite.</span>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={f.q}
              onChange={(e) => setF({ ...f, q: e.target.value })}
              placeholder="Cerca squadra"
              aria-label="Cerca squadra"
              className={cn(inputCls, 'pl-9')}
            />
          </label>
          <SelectInput value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} aria-label="Giornata">
            <option value="all">Tutte le giornate</option>
            {allDates.map((d) => (
              <option key={d} value={d}>
                {dayLabel(d)}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            value={f.phase}
            onChange={(e) => setF({ ...f, phase: e.target.value as Filters['phase'] })}
            aria-label="Fase"
          >
            <option value="all">Tutte le fasi</option>
            {(Object.keys(phaseLabel) as MatchPhase[]).map((p) => (
              <option key={p} value={p}>
                {phaseLabel[p]}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            value={f.group}
            onChange={(e) => setF({ ...f, group: e.target.value as Filters['group'] })}
            aria-label="Girone"
            disabled={data.groupCount < 2}
          >
            <option value="all">Tutti i gironi</option>
            {groupsOf(data).map((g) => (
              <option key={g} value={g}>
                Girone {g}
              </option>
            ))}
          </SelectInput>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PillGroup
            value={f.status}
            onChange={(status) => setF({ ...f, status })}
            options={[
              { id: 'all', label: `Tutte · ${base.length}` },
              ...statuses.map((s) => ({ id: s.id, label: `${s.label} · ${base.filter((m) => m.status === s.id).length}` })),
            ]}
          />
          <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            {list.length} {list.length === 1 ? 'partita' : 'partite'}
            {filtered && (
              <button type="button" onClick={() => setF(noFilters)} className="text-primary hover:underline">
                Azzera filtri
              </button>
            )}
          </span>
        </div>
      </div>

      {list.length === 0 && (
        <div className="rounded-[14px] border border-dashed border-white/[0.12] p-10 text-center text-zinc-400">
          {data.matches.length === 0 ? 'Nessuna partita in calendario.' : 'Nessuna partita con questi filtri.'}
        </div>
      )}

      {days.map((day) => (
        <div key={day} className="flex flex-col gap-2.5">
          <span className="border-b border-white/[0.08] pb-2 font-display text-xl uppercase text-white">
            {dayLabel(day)}
          </span>
          <div className="grid gap-3 lg:grid-cols-2">
            {list
              .filter((m) => m.date === day)
              .map((m) => (
                <AdminMatchCard key={m.id} m={m} onEdit={() => setEditing(m)} />
              ))}
          </div>
        </div>
      ))}

      {editing && <MatchModal key={editing === 'new' ? 'new' : editing.id} match={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
