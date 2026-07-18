import { useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  CalendarDays,
  Cloud,
  CloudOff,
  Download,
  ExternalLink,
  Info,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  ScrollText,
  Trash2,
  Trophy,
  Upload,
  Users,
  Volleyball,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTournament, type SyncStatus } from '@/data/store';
import {
  phaseLabel,
  type Match,
  type MatchPhase,
  type MatchStatus,
  type Team,
  type TournamentData,
} from '@/data/tournament';

/* Codice di accesso all'area admin — CAMBIALO QUI */
const ADMIN_CODE = 'patronale2026';
const SESSION_KEY = 'torneo-admin-ok';

/* ---------- piccoli componenti di form ---------- */

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-sm border border-white/10 bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-primary [color-scheme:dark]';

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, props.className)} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(inputCls, 'resize-y', props.className)} />;
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-sm border border-dashed border-primary/50 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

function IconBtn({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'rounded-sm p-2 transition-colors',
        danger ? 'text-zinc-500 hover:bg-red-500/10 hover:text-red-500' : 'text-zinc-400 hover:bg-white/5 hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

/* ---------- gate con codice ---------- */

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pt-16">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-md border border-white/10 bg-[#101010] p-8 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-primary/15 text-primary">
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-white">Area Organizzatori</h1>
        <p className="mt-1 text-sm text-zinc-500">Inserisci il codice per gestire il torneo</p>
        <input
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          placeholder="Codice di accesso"
          autoFocus
          className={cn(inputCls, 'mt-6 text-center tracking-[0.3em]', error && 'border-red-500')}
        />
        {error && <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-red-500">Codice errato</p>}
        <button
          type="submit"
          className="font-display mt-5 w-full rounded-sm bg-primary px-4 py-3 text-sm uppercase tracking-widest text-white transition-transform hover:scale-[1.02]"
        >
          Entra
        </button>
        <Link to="/" className="mt-4 inline-block text-xs uppercase tracking-widest text-zinc-600 hover:text-primary">
          ← Torna al sito
        </Link>
      </form>
    </div>
  );
}

/* ---------- editor singola partita ---------- */

function MatchEditor({ match }: { match: Match }) {
  const { data, update } = useTournament();

  const patch = (p: Partial<Match>) =>
    update((d) => ({
      ...d,
      matches: d.matches.map((m) => (m.id === match.id ? { ...m, ...p } : m)),
    }));

  const remove = () => {
    if (window.confirm('Eliminare questa partita?')) {
      update((d) => ({ ...d, matches: d.matches.filter((m) => m.id !== match.id) }));
    }
  };

  const teamOptions = (
    <>
      <option value="">— Testo libero —</option>
      <optgroup label="Girone unico">
        {data.teams.filter((t) => t.group === 'A').map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </optgroup>
    </>
  );

  return (
    <div className="rounded-md border border-white/10 bg-[#101010] p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-sm bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
          {phaseLabel[match.phase]}{match.phase === 'gironi' && match.group ? ` · Girone ${match.group}` : ''}
        </span>
        <IconBtn onClick={remove} title="Elimina partita" danger>
          <Trash2 className="h-4 w-4" />
        </IconBtn>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Data">
          <TextInput type="date" value={match.date} onChange={(e) => patch({ date: e.target.value })} />
        </Field>
        <Field label="Ora">
          <TextInput type="time" value={match.time} onChange={(e) => patch({ time: e.target.value })} />
        </Field>
        <Field label="Fase">
          <SelectInput
            value={match.phase}
            onChange={(e) => {
              const phase = e.target.value as MatchPhase;
              patch({ phase, group: phase === 'gironi' ? (match.group ?? 'A') : undefined });
            }}
          >
            {(Object.keys(phaseLabel) as MatchPhase[]).map((p) => (
              <option key={p} value={p}>{phaseLabel[p]}</option>
            ))}
          </SelectInput>
        </Field>
        {match.phase === 'gironi' ? (
          <Field label="Girone">
            <SelectInput value={match.group ?? 'A'} onChange={(e) => patch({ group: e.target.value as 'A' })}>
              <option value="A">Girone unico</option>
            </SelectInput>
          </Field>
        ) : (
          <Field label="Stato">
            <StatusSelect match={match} patch={patch} />
          </Field>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(['home', 'away'] as const).map((side) => (
          <div key={side} className="space-y-2">
            <Field label={side === 'home' ? 'Squadra 1' : 'Squadra 2'}>
              <SelectInput
                value={match[side]}
                onChange={(e) => patch({ [side]: e.target.value } as Partial<Match>)}
              >
                {teamOptions}
              </SelectInput>
            </Field>
            {match[side] === '' && (
              <TextInput
                value={(side === 'home' ? match.homeLabel : match.awayLabel) ?? ''}
                onChange={(e) =>
                  patch({ [side === 'home' ? 'homeLabel' : 'awayLabel']: e.target.value } as Partial<Match>)
                }
                placeholder={side === 'home' ? 'es. 1ª Classificata' : 'es. 4ª Classificata'}
              />
            )}
          </div>
        ))}
      </div>

      {match.phase === 'gironi' && (
        <div className="mt-3 max-w-xs">
          <Field label="Stato">
            <StatusSelect match={match} patch={patch} />
          </Field>
        </div>
      )}

      {/* set */}
      {match.status !== 'scheduled' && (
        <div className="mt-4 border-t border-white/5 pt-3">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Punteggi dei set
          </span>
          <div className="space-y-2">
            {match.sets.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-12 text-xs uppercase tracking-widest text-zinc-500">Set {i + 1}</span>
                <TextInput
                  type="number"
                  min={0}
                  value={s.home}
                  onChange={(e) =>
                    patch({
                      sets: match.sets.map((x, j) => (j === i ? { ...x, home: Number(e.target.value) || 0 } : x)),
                    })
                  }
                  className="w-20 text-center"
                />
                <span className="text-zinc-600">—</span>
                <TextInput
                  type="number"
                  min={0}
                  value={s.away}
                  onChange={(e) =>
                    patch({
                      sets: match.sets.map((x, j) => (j === i ? { ...x, away: Number(e.target.value) || 0 } : x)),
                    })
                  }
                  className="w-20 text-center"
                />
                <IconBtn
                  onClick={() => patch({ sets: match.sets.filter((_, j) => j !== i) })}
                  title="Rimuovi set"
                  danger
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            ))}
          </div>
          <button
            onClick={() => patch({ sets: [...match.sets, { home: 11, away: 9 }] })}
            className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Aggiungi set
          </button>
        </div>
      )}
    </div>
  );
}

function StatusSelect({ match, patch }: { match: Match; patch: (p: Partial<Match>) => void }) {
  return (
    <SelectInput
      value={match.status}
      onChange={(e) => {
        const status = e.target.value as MatchStatus;
        patch({ status, sets: status === 'scheduled' ? [] : match.sets.length ? match.sets : [{ home: 11, away: 9 }] });
      }}
    >
      <option value="scheduled">Da giocare</option>
      <option value="live">Live</option>
      <option value="finished">Terminata</option>
    </SelectInput>
  );
}

/* ---------- schede dell'admin ---------- */

type TabId = 'info' | 'squadre' | 'partite' | 'programma' | 'regole' | 'albo' | 'backup';

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'info', label: 'Torneo', icon: Info },
  { id: 'squadre', label: 'Squadre', icon: Users },
  { id: 'partite', label: 'Partite', icon: Volleyball },
  { id: 'programma', label: 'Programma', icon: CalendarDays },
  { id: 'regole', label: 'Regole', icon: ScrollText },
  { id: 'albo', label: 'Albo d\'Oro', icon: Trophy },
  { id: 'backup', label: 'Backup', icon: Download },
];

function InfoTab() {
  const { data, update } = useTournament();
  const set = (k: keyof TournamentData['info']) => (e: React.ChangeEvent<HTMLInputElement>) =>
    update((d) => ({ ...d, info: { ...d.info, [k]: e.target.value } }));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome del torneo"><TextInput value={data.info.name} onChange={set('name')} /></Field>
      <Field label="Sottotitolo (scritta brush)"><TextInput value={data.info.brushSubtitle} onChange={set('brushSubtitle')} /></Field>
      <Field label="Edizione"><TextInput value={data.info.edition} onChange={set('edition')} /></Field>
      <Field label="Campo / luogo"><TextInput value={data.info.location} onChange={set('location')} /></Field>
      <Field label="Date"><TextInput value={data.info.dates} onChange={set('dates')} /></Field>
      <Field label="Organizzatore"><TextInput value={data.info.organizer} onChange={set('organizer')} /></Field>
    </div>
  );
}

function SquadreTab() {
  const { data, update } = useTournament();

  const patchTeam = (id: string, p: Partial<Team>) =>
    update((d) => ({ ...d, teams: d.teams.map((t) => (t.id === id ? { ...t, ...p } : t)) }));

  const addTeam = (group: 'A') =>
    update((d) => ({
      ...d,
      teams: [...d.teams, { id: `t${Date.now()}`, name: `Nuova squadra`, group }],
    }));

  const removeTeam = (id: string) => {
    if (window.confirm('Eliminare la squadra? Le partite già inserite mostreranno "Da definire".')) {
      update((d) => ({ ...d, teams: d.teams.filter((t) => t.id !== id) }));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {(['A'] as const).map((g) => (
        <div key={g} className="rounded-md border border-white/10 bg-[#101010] p-4">
          <h3 className={cn('font-display mb-3 text-lg uppercase tracking-wide', 'text-primary')}>
            Girone unico
          </h3>
          <div className="space-y-2">
            {data.teams.filter((t) => t.group === g).map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <TextInput value={t.name} onChange={(e) => patchTeam(t.id, { name: e.target.value })} />
                <SelectInput
                  value={t.group}
                  onChange={(e) => patchTeam(t.id, { group: e.target.value as 'A' })}
                  className="w-32"
                >
                  <option value="A">Girone unico</option>
                </SelectInput>
                <IconBtn onClick={() => removeTeam(t.id)} title="Elimina squadra" danger>
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <AddButton onClick={() => addTeam(g)}>Aggiungi squadra</AddButton>
          </div>
        </div>
      ))}
    </div>
  );
}

function PartiteTab() {
  const { data, update } = useTournament();
  const [phaseFilter, setPhaseFilter] = useState<'all' | MatchPhase>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMatchData, setNewMatchData] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: '21:00',
    phase: 'gironi' as MatchPhase,
    home: '',
    away: '',
  });

  const sorted = [...data.matches].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const visible = phaseFilter === 'all' ? sorted : sorted.filter((m) => m.phase === phaseFilter);

  const addMatch = () => {
    update((d) => ({
      ...d,
      matches: [
        ...d.matches,
        {
          id: `m${Date.now()}`,
          date: newMatchData.date,
          time: newMatchData.time,
          phase: newMatchData.phase,
          group: newMatchData.phase === 'gironi' ? 'A' : undefined,
          home: newMatchData.home,
          away: newMatchData.away,
          homeLabel: newMatchData.home === '' ? 'Da definire' : undefined,
          awayLabel: newMatchData.away === '' ? 'Da definire' : undefined,
          sets: [],
          status: 'scheduled',
        },
      ],
    }));
    setShowAddModal(false);
    setNewMatchData({
      date: new Date().toISOString().slice(0, 10),
      time: '21:00',
      phase: 'gironi',
      home: '',
      away: '',
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'gironi', 'semifinale', 'finalina', 'finale'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPhaseFilter(p)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors',
                phaseFilter === p ? 'bg-primary text-white' : 'border border-white/10 text-zinc-400 hover:text-white',
              )}
            >
              {p === 'all' ? 'Tutte' : phaseLabel[p]}
            </button>
          ))}
        </div>
        <AddButton onClick={() => setShowAddModal(true)}>Nuova partita</AddButton>

      {/* Modal per aggiungere partita */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#101010] p-6 shadow-2xl">
            <h3 className="mb-4 font-display text-xl uppercase tracking-wide text-white">Nuova partita</h3>
            
            <div className="space-y-4">
              <Field label="Data">
                <TextInput 
                  type="date" 
                  value={newMatchData.date} 
                  onChange={(e) => setNewMatchData({ ...newMatchData, date: e.target.value })} 
                />
              </Field>
              
              <Field label="Ora">
                <TextInput 
                  type="time" 
                  value={newMatchData.time} 
                  onChange={(e) => setNewMatchData({ ...newMatchData, time: e.target.value })} 
                />
              </Field>
              
              <Field label="Fase">
                <select 
                  value={newMatchData.phase}
                  onChange={(e) => setNewMatchData({ ...newMatchData, phase: e.target.value as MatchPhase })}
                  className={inputCls}
                >
                  {(Object.keys(phaseLabel) as MatchPhase[]).map((p) => (
                    <option key={p} value={p}>{phaseLabel[p]}</option>
                  ))}
                </select>
              </Field>
              
              <Field label="Squadra casa">
                <select 
                  value={newMatchData.home}
                  onChange={(e) => setNewMatchData({ ...newMatchData, home: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Nessuna squadra</option>
                  {data.teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </Field>
              
              <Field label="Squadra ospite">
                <select 
                  value={newMatchData.away}
                  onChange={(e) => setNewMatchData({ ...newMatchData, away: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Nessuna squadra</option>
                  {data.teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-sm border border-white/10 bg-[#101010] px-4 py-2 text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
              >
                Annulla
              </button>
              <button
                onClick={addMatch}
                className="rounded-sm bg-primary px-4 py-2 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-colors hover:bg-primary/80"
              >
                Crea partita
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((m) => (
          <MatchEditor key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}

function ProgrammaTab() {
  const { data, update } = useTournament();
  const on = data.openingNight;

  const patch = (p: Partial<typeof on>) => update((d) => ({ ...d, openingNight: { ...d.openingNight, ...p } }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Badge (es. Gran Opening)"><TextInput value={on.badge} onChange={(e) => patch({ badge: e.target.value })} /></Field>
        <Field label="Titolo serata"><TextInput value={on.title} onChange={(e) => patch({ title: e.target.value })} /></Field>
      </div>

      <div className="rounded-md border border-white/10 bg-[#101010] p-4">
        <span className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">Programma orario</span>
        <div className="space-y-2">
          {on.schedule.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput
                value={s.time}
                onChange={(e) => patch({ schedule: on.schedule.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)) })}
                className="w-24"
              />
              <TextInput
                value={s.label}
                onChange={(e) => patch({ schedule: on.schedule.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
              />
              <IconBtn onClick={() => patch({ schedule: on.schedule.filter((_, j) => j !== i) })} title="Rimuovi riga" danger>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <AddButton onClick={() => patch({ schedule: [...on.schedule, { time: '20:00', label: 'Nuovo momento' }] })}>
            Aggiungi orario
          </AddButton>
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-[#101010] p-4">
        <span className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">Nota in evidenza</span>
        <div className="space-y-3">
          <Field label="Titolo nota"><TextInput value={on.note.title} onChange={(e) => patch({ note: { ...on.note, title: e.target.value } })} /></Field>
          <Field label="Testo"><TextArea value={on.note.text} onChange={(e) => patch({ note: { ...on.note, text: e.target.value } })} /></Field>
        </div>
      </div>
    </div>
  );
}

function RegoleTab() {
  const { data, update } = useTournament();

  const patch = (i: number, p: Partial<{ title: string; text: string }>) =>
    update((d) => ({ ...d, rules: d.rules.map((r, j) => (j === i ? { ...r, ...p } : r)) }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {data.rules.map((r, i) => (
        <div key={i} className="rounded-md border border-white/10 bg-[#101010] p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="font-display text-2xl text-primary/70">{String(i + 1).padStart(2, '0')}</span>
            <IconBtn
              onClick={() => update((d) => ({ ...d, rules: d.rules.filter((_, j) => j !== i) }))}
              title="Elimina regola"
              danger
            >
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
          <div className="mt-2 space-y-3">
            <Field label="Titolo"><TextInput value={r.title} onChange={(e) => patch(i, { title: e.target.value })} /></Field>
            <Field label="Testo"><TextArea value={r.text} onChange={(e) => patch(i, { text: e.target.value })} /></Field>
          </div>
        </div>
      ))}
      <div className="flex items-start">
        <AddButton onClick={() => update((d) => ({ ...d, rules: [...d.rules, { title: 'Nuova regola', text: '' }] }))}>
          Aggiungi regola
        </AddButton>
      </div>
    </div>
  );
}

function AlboTab() {
  const { data, update } = useTournament();

  const patchEdition = (index: number, p: Partial<typeof data.hallOfFame[0]>) =>
    update((d) => ({ ...d, hallOfFame: d.hallOfFame.map((e, i) => (i === index ? { ...e, ...p } : e)) }));

  const addEdition = () =>
    update((d) => ({
      ...d,
      hallOfFame: [
        ...d.hallOfFame,
        {
          year: new Date().getFullYear().toString(),
          winner: 'Da definire',
          runnerUp: 'Da definire',
          thirdPlace: 'Da definire',
          matchesPlayed: 0,
          totalGoals: 0,
          teamsCount: 8,
        },
      ],
    }));

  const removeEdition = (index: number) =>
    update((d) => ({ ...d, hallOfFame: d.hallOfFame.filter((_, i) => i !== index) }));

  const autoGenerateCurrentEdition = () => {
    const finishedMatches = data.matches.filter(m => m.status === 'finished');
    const totalGoals = finishedMatches.reduce((sum, m) => {
      return sum + m.sets.reduce((setSum, s) => setSum + s.home + s.away, 0);
    }, 0);

    // Calculate standings to determine winner
    const standings = new Map<string, { points: number; name: string }>();
    data.teams.forEach(t => standings.set(t.id, { points: 0, name: t.name }));
    
    finishedMatches.forEach(m => {
      if (!m.home || !m.away) return;
      const homeSets = m.sets.filter(s => s.home > s.away).length;
      const awaySets = m.sets.filter(s => s.away > s.home).length;
      
      const home = standings.get(m.home);
      const away = standings.get(m.away);
      if (home && away) {
        if (homeSets > awaySets) {
          home.points += 3;
        } else if (awaySets > homeSets) {
          away.points += 3;
        }
      }
    });

    const sortedStandings = Array.from(standings.values()).sort((a, b) => b.points - a.points);
    
    const winner = sortedStandings[0]?.name || 'Da definire';
    const runnerUp = sortedStandings[1]?.name || 'Da definire';
    const thirdPlace = sortedStandings[2]?.name || 'Da definire';

    update((d) => ({
      ...d,
      hallOfFame: [
        ...d.hallOfFame,
        {
          year: new Date().getFullYear().toString(),
          winner,
          runnerUp,
          thirdPlace,
          matchesPlayed: finishedMatches.length,
          totalGoals,
          teamsCount: data.teams.length,
        },
      ],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toggle statistiche storiche */}
      <div className="flex items-center justify-between rounded-md border border-white/10 bg-[#101010] p-4">
        <div>
          <h3 className="font-display text-lg uppercase tracking-wide text-white">Mostra statistiche storiche</h3>
          <p className="mt-1 text-sm text-zinc-500">Abilita o disabilita la sezione delle statistiche storiche nella pagina Albo d'Oro</p>
        </div>
        <button
          onClick={() => update((d) => ({ ...d, showHistoricalStats: d.showHistoricalStats === false }))}
          className={cn(
            'relative h-7 w-12 rounded-full p-1 transition-colors duration-200',
            data.showHistoricalStats !== false ? 'bg-primary' : 'bg-zinc-600'
          )}
        >
          <span
            className={cn(
              'block h-5 w-5 rounded-full bg-white transition-transform duration-200',
              data.showHistoricalStats !== false ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {/* Generazione automatica */}
      <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 p-4">
        <div>
          <h3 className="font-display text-lg uppercase tracking-wide text-white">Genera edizione corrente</h3>
          <p className="mt-1 text-sm text-zinc-500">Calcola automaticamente i risultati del torneo corrente e aggiungili all'Albo d'Oro</p>
        </div>
        <AddButton onClick={autoGenerateCurrentEdition}>Genera automaticamente</AddButton>
      </div>

      {/* Edizioni */}
      <div className="grid gap-6 lg:grid-cols-2">
        {data.hallOfFame.map((edition, index) => (
          <div key={edition.year} className="rounded-md border border-white/10 bg-[#101010] p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <h3 className="font-display text-2xl text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">{edition.year}</h3>
              <IconBtn onClick={() => removeEdition(index)} title="Rimuovi edizione" danger>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
            <div className="space-y-3">
              <Field label="Vincitore">
                <TextInput value={edition.winner} onChange={(e) => patchEdition(index, { winner: e.target.value })} />
              </Field>
              <Field label="Secondo">
                <TextInput value={edition.runnerUp} onChange={(e) => patchEdition(index, { runnerUp: e.target.value })} />
              </Field>
              <Field label="Terzo">
                <TextInput value={edition.thirdPlace} onChange={(e) => patchEdition(index, { thirdPlace: e.target.value })} />
              </Field>
              <Field label="MVP (opzionale)">
                <TextInput value={edition.mvp || ''} onChange={(e) => patchEdition(index, { mvp: e.target.value })} />
              </Field>
              <Field label="Top Scorer (opzionale)">
                <TextInput value={edition.topScorer || ''} onChange={(e) => patchEdition(index, { topScorer: e.target.value })} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Partite giocate">
                  <TextInput 
                    type="number" 
                    value={edition.matchesPlayed || 0} 
                    onChange={(e) => patchEdition(index, { matchesPlayed: parseInt(e.target.value) || 0 })} 
                  />
                </Field>
                <Field label="Goal totali">
                  <TextInput 
                    type="number" 
                    value={edition.totalGoals || 0} 
                    onChange={(e) => patchEdition(index, { totalGoals: parseInt(e.target.value) || 0 })} 
                  />
                </Field>
                <Field label="Squadre">
                  <TextInput 
                    type="number" 
                    value={edition.teamsCount || 8} 
                    onChange={(e) => patchEdition(index, { teamsCount: parseInt(e.target.value) || 8 })} 
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-start">
          <AddButton onClick={addEdition}>Aggiungi edizione</AddButton>
        </div>
      </div>
    </div>
  );
}

function BackupTab() {
  const { data, setData, reset } = useTournament();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dati-torneo.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as TournamentData;
        if (!parsed || !Array.isArray(parsed.teams) || !Array.isArray(parsed.matches) || !parsed.info) {
          setMsg('File non valido: mancano sezioni obbligatorie.');
          return;
        }
        setData(parsed);
        setMsg('Dati importati correttamente.');
      } catch {
        setMsg('File non valido: JSON illeggibile.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-md border border-white/10 bg-[#101010] p-5">
        <h3 className="font-display text-lg uppercase tracking-wide text-white">Esporta dati</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Scarica tutti i dati del torneo in un file JSON: utile come backup o per spostarli su un altro dispositivo.
        </p>
        <button
          onClick={exportJson}
          className="font-display mt-4 flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm uppercase tracking-widest text-white"
        >
          <Download className="h-4 w-4" /> Scarica JSON
        </button>
      </div>

      <div className="rounded-md border border-white/10 bg-[#101010] p-5">
        <h3 className="font-display text-lg uppercase tracking-wide text-white">Importa dati</h3>
        <p className="mt-1 text-sm text-zinc-500">Carica un file JSON esportato in precedenza. Sostituisce i dati attuali.</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = '';
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="font-display mt-4 flex items-center gap-2 rounded-sm border border-white/15 px-5 py-2.5 text-sm uppercase tracking-widest text-zinc-200 hover:border-primary hover:text-primary"
        >
          <Upload className="h-4 w-4" /> Carica JSON
        </button>
        {msg && <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary">{msg}</p>}
      </div>

      <div className="rounded-md border border-red-500/20 bg-red-500/[0.04] p-5">
        <h3 className="font-display text-lg uppercase tracking-wide text-red-400">Ripristina dati iniziali</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Cancella tutte le modifiche salvate su questo dispositivo e torna ai dati di partenza.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Sicuro? Tutte le modifiche andranno perse.')) reset();
          }}
          className="font-display mt-4 flex items-center gap-2 rounded-sm border border-red-500/40 px-5 py-2.5 text-sm uppercase tracking-widest text-red-400 hover:bg-red-500/10"
        >
          <RotateCcw className="h-4 w-4" /> Ripristina
        </button>
      </div>
    </div>
  );
}

/* ---------- banner sincronizzazione ---------- */

function SyncBanner() {
  const { syncStatus, syncError, usesSupabase } = useTournament();

  if (!usesSupabase) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs text-zinc-300">
        <CloudOff className="h-4 w-4 shrink-0 text-amber-400" />
        Supabase non configurato: le modifiche restano solo su questo browser (localStorage).
      </div>
    );
  }

  const config: Record<
    SyncStatus,
    { icon: ComponentType<{ className?: string }>; text: string; className: string }
  > = {
    idle: {
      icon: Cloud,
      text: 'Connesso a Supabase.',
      className: 'border-primary/25 bg-primary/[0.06]',
    },
    loading: {
      icon: Loader2,
      text: 'Caricamento dati dal cloud…',
      className: 'border-white/10 bg-white/[0.03]',
    },
    syncing: {
      icon: Loader2,
      text: 'Salvataggio in corso…',
      className: 'border-white/10 bg-white/[0.03]',
    },
    synced: {
      icon: Cloud,
      text: 'Modifiche sincronizzate — visibili a tutti i visitatori in tempo reale.',
      className: 'border-primary/25 bg-primary/[0.06]',
    },
    error: {
      icon: CloudOff,
      text: syncError ?? 'Errore di sincronizzazione.',
      className: 'border-red-500/25 bg-red-500/[0.06]',
    },
    local: {
      icon: CloudOff,
      text: 'Modalità locale.',
      className: 'border-amber-500/25 bg-amber-500/[0.06]',
    },
  };

  const { icon: Icon, text, className } = config[syncStatus];
  const spinning = syncStatus === 'loading' || syncStatus === 'syncing';

  return (
    <div className={cn('mt-4 flex items-center gap-2 rounded-md border px-4 py-3 text-xs text-zinc-300', className)}>
      <Icon className={cn('h-4 w-4 shrink-0 text-primary', spinning && 'animate-spin')} />
      {text}
    </div>
  );
}

/* ---------- pagina ---------- */

export default function Admin() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [tab, setTab] = useState<TabId>('partite');

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display title-glow text-4xl uppercase tracking-wide text-white sm:text-5xl">
            Pannello di controllo
          </h1>
          <p className="font-brush mt-1 text-2xl text-primary">gestione torneo</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-sm border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-primary hover:text-primary"
        >
          <ExternalLink className="h-4 w-4" /> Vedi il sito
        </Link>
      </div>

      <SyncBanner />

      {/* tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-sm px-4 py-2 font-display text-sm uppercase tracking-widest transition-colors',
              tab === t.id
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,77,0,0.4)]'
                : 'border border-white/10 bg-[#101010] text-zinc-400 hover:text-white',
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'info' && <InfoTab />}
        {tab === 'squadre' && <SquadreTab />}
        {tab === 'partite' && <PartiteTab />}
        {tab === 'programma' && <ProgrammaTab />}
        {tab === 'regole' && <RegoleTab />}
        {tab === 'albo' && <AlboTab />}
        {tab === 'backup' && <BackupTab />}
      </div>
    </div>
  );
}
