import { useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ExternalLink, LogOut, Plus, Trash2 } from 'lucide-react';
import { TournamentProvider, useTournament } from '@/data/store';
import { useTournamentsRegistry, type TournamentSummary } from '@/data/tournaments-registry';
import { SITE_SLUG } from '@/data/site-config';
import { computeStandings, type TournamentData } from '@/data/tournament';
import { cn, getErrorMessage } from '@/lib/utils';
import AdminGate, { isAdminUnlocked, lockAdmin } from './AdminGate';
import { Btn, ConfirmProvider, Field, Modal, TextInput } from './ui';
import { archiveTournament, createTournamentData, newEditionOf, uniqueSlug } from './tournament-ops';
import { useRegistrations } from './use-registrations';
import PartiteTab from './tabs/PartiteTab';
import SquadreTab from './tabs/SquadreTab';
import IscrizioniTab from './tabs/IscrizioniTab';
import ModuliTab from './tabs/ModuliTab';
import TorneoTab from './tabs/TorneoTab';
import AlboTab from './tabs/AlboTab';
import ArchivioTab from './tabs/ArchivioTab';
import SitoTab from './tabs/SitoTab';

type TabId = 'partite' | 'squadre' | 'iscrizioni' | 'moduli' | 'torneo' | 'albo' | 'archivio' | 'sito';
const TAB_IDS: TabId[] = ['partite', 'squadre', 'iscrizioni', 'moduli', 'torneo', 'albo', 'archivio', 'sito'];

/* ============================================================
   Pannello organizzatori: un solo pannello per tutti i tornei
   ============================================================ */

export default function AdminPanel() {
  const [unlocked, setUnlocked] = useState(isAdminUnlocked);

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />;

  return (
    <ConfirmProvider>
      <Panel
        onLogout={() => {
          lockAdmin();
          setUnlocked(false);
        }}
      />
    </ConfirmProvider>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const { tournaments, archived, loading, error } = useTournamentsRegistry();
  const [params, setParams] = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);

  const selected = tournaments.find((t) => t.slug === params.get('t')) ?? tournaments[0];
  const tabParam = params.get('tab') as TabId | null;
  const tab: TabId = tabParam && TAB_IDS.includes(tabParam) ? tabParam : 'partite';

  const go = (slug: string | undefined, nextTab: TabId = tab) => {
    const p = new URLSearchParams();
    if (slug) p.set('t', slug);
    p.set('tab', nextTab);
    setParams(p);
  };

  const takenSlugs = [...tournaments, ...archived].map((t) => t.slug).concat(SITE_SLUG);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-zinc-500">Caricamento…</div>;
  }

  const header = (
    <PanelHeader
      subtitle={selected?.name ?? 'Nessun torneo attivo'}
      status={selected ? undefined : null}
      onLogout={onLogout}
    />
  );

  if (!selected) {
    return (
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 pb-24 pt-10 sm:px-6">
        {header}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-white/[0.14] px-6 py-12 text-center">
          <span className="font-display text-[28px] uppercase text-white">Nessun torneo attivo</span>
          <span className="max-w-[48ch] text-[15px] text-zinc-400">
            Crea un torneo nuovo oppure ripristina o duplica uno di quelli in archivio.
          </span>
          <Btn variant="primary" onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" /> Nuovo torneo
          </Btn>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-display text-xl uppercase text-white">Sito</span>
          <SitoTab backup={false} />
        </div>
        {archived.length > 0 && <ArchivioTabStandalone go={go} takenSlugs={takenSlugs} />}
        {newOpen && (
          <NewTournamentModal
            onClose={() => setNewOpen(false)}
            takenSlugs={takenSlugs}
            onCreated={(slug) => go(slug, 'torneo')}
          />
        )}
      </div>
    );
  }

  return (
    <TournamentProvider slug={selected.slug} key={selected.slug}>
      <PanelBody
        tab={tab}
        go={go}
        onLogout={onLogout}
        takenSlugs={takenSlugs}
        newOpen={newOpen}
        setNewOpen={setNewOpen}
      />
    </TournamentProvider>
  );
}

/* ---------- intestazione ---------- */

function SaveBadge() {
  const { syncStatus, savedAt, syncError } = useTournament();
  const time = savedAt?.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const label =
    syncStatus === 'syncing'
      ? 'Salvataggio…'
      : syncStatus === 'loading'
        ? 'Caricamento…'
        : syncStatus === 'error'
          ? 'Errore di salvataggio'
          : syncStatus === 'local'
            ? 'Solo su questo browser'
            : time
              ? `Salvato · ${time}`
              : 'Salvato';
  const tone =
    syncStatus === 'error'
      ? 'border-red-500/50 text-red-400'
      : syncStatus === 'local'
        ? 'border-amber-500/40 text-amber-400'
        : 'border-green-500/40 text-green-400';
  return (
    <span
      title={syncError ?? undefined}
      className={cn('rounded-full border px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em]', tone)}
    >
      {label}
    </span>
  );
}

function PanelHeader({
  subtitle,
  status,
  onLogout,
}: {
  subtitle: string;
  /** undefined = badge di salvataggio del torneo, null = nessun badge */
  status?: ReactNode;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-glow text-[clamp(40px,5vw,64px)] uppercase leading-none text-white">
          Pannello organizzatori
        </h1>
        <p className="font-brush mt-3 origin-left -rotate-1 text-[30px] leading-none text-primary">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {status === undefined ? <SaveBadge /> : status}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-display text-sm uppercase tracking-[0.1em] text-zinc-200 transition-colors hover:border-primary hover:text-primary"
        >
          <ExternalLink className="h-4 w-4" /> Vedi sito
        </Link>
        <Btn onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Esci
        </Btn>
      </div>
    </div>
  );
}

/* ---------- corpo del pannello (dentro il torneo selezionato) ---------- */

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-white/[0.08] bg-[#101010] p-4">
      <span className="label-xs">{label}</span>
      <span className={cn('truncate font-display text-[28px] uppercase leading-none text-white', tone)}>{value}</span>
    </div>
  );
}

function PanelBody({
  tab,
  go,
  onLogout,
  takenSlugs,
  newOpen,
  setNewOpen,
}: {
  tab: TabId;
  go: (slug: string | undefined, tab?: TabId) => void;
  onLogout: () => void;
  takenSlugs: string[];
  newOpen: boolean;
  setNewOpen: (v: boolean) => void;
}) {
  const { data, saveNow, discardPending } = useTournament();
  const { tournaments, createTournament, deleteTournament, reload } = useTournamentsRegistry();
  const regs = useRegistrations(data.slug);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);
  const others = tournaments.filter((t) => t.slug !== data.slug);

  const done = data.matches.filter((m) => m.status === 'finished').length;
  const live = data.matches.filter((m) => m.status === 'live').length;
  const played = data.matches.some((m) => m.phase === 'gironi' && m.status === 'finished');
  const leader = played ? computeStandings(data.teams, data.matches)[0]?.team.name : undefined;
  const pending = regs.list.filter((r) => r.status === 'pending').length;

  const run = (task: () => Promise<void>) => {
    setOpError(null);
    task().catch((err: unknown) => setOpError(getErrorMessage(err, 'Operazione non riuscita')));
  };

  const archive = () =>
    run(async () => {
      await saveNow(archiveTournament(data));
      reload();
      go(others[0]?.slug, 'archivio');
    });

  const newEdition = (src: TournamentData) =>
    run(async () => {
      const slug = uniqueSlug(newEditionOf(src, '').info.name, takenSlugs);
      await createTournament(slug, newEditionOf(src, slug));
      go(slug, 'torneo');
    });

  const remove = () =>
    run(async () => {
      discardPending();
      await deleteTournament(data.slug);
      setDeleteOpen(false);
      go(others[0]?.slug, 'partite');
    });

  const tabs: { id: TabId; label: string; count?: string | number }[] = [
    { id: 'partite', label: 'Partite', count: data.matches.length },
    { id: 'squadre', label: 'Squadre', count: data.teams.length },
    { id: 'iscrizioni', label: 'Iscrizioni', count: pending ? `${pending} nuove` : undefined },
    { id: 'moduli', label: 'Moduli', count: data.forms.length },
    { id: 'torneo', label: 'Torneo' },
    { id: 'albo', label: "Albo d'oro", count: data.hallOfFame.length },
    { id: 'archivio', label: 'Archivio' },
    { id: 'sito', label: 'Sito' },
  ];

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 pb-24 pt-10 sm:px-6">
      <PanelHeader subtitle={data.info.name} onLogout={onLogout} />

      {/* stai gestendo */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/40 p-3">
        <span className="label-xs mr-1">Stai gestendo</span>
        {tournaments.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => go(t.slug)}
            className={cn(
              'whitespace-nowrap rounded-full border px-4 py-2 font-display text-sm uppercase tracking-[0.08em] transition-colors',
              t.slug === data.slug
                ? 'border-primary bg-primary/[0.16] text-white'
                : 'border-white/[0.12] text-zinc-400 hover:border-primary/50 hover:text-white',
            )}
          >
            {t.name}
          </button>
        ))}
        <Btn small variant="quiet" className="border-dashed border-white/20" onClick={() => setNewOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Nuovo torneo
        </Btn>
        <Btn small variant="danger" className="ml-auto" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-3.5 w-3.5" /> Elimina torneo
        </Btn>
      </div>

      {opError && <p className="text-sm font-semibold text-red-400">{opError}</p>}

      {/* statistiche */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Partite giocate" value={`${done}/${data.matches.length}`} />
        <Stat label="In campo ora" value={String(live)} tone={live ? 'text-red-400' : undefined} />
        <Stat label="Capolista" value={leader ?? '—'} tone="text-primary" />
        <Stat label="Iscrizioni da gestire" value={String(pending)} tone={pending ? 'text-amber-400' : undefined} />
      </div>

      {/* schede */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => go(data.slug, t.id)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 font-display text-sm uppercase tracking-[0.08em] transition-colors',
              tab === t.id
                ? 'bg-gradient-to-r from-primary to-fuchsia-600 text-white shadow-[0_0_20px_rgba(255,0,255,0.35)]'
                : 'border border-white/[0.08] bg-[#101010] text-zinc-400 hover:text-white',
            )}
          >
            {t.label}
            {t.count !== undefined && t.count !== 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-body text-[11px] font-bold tracking-normal',
                  tab === t.id ? 'bg-white/20' : 'bg-white/[0.06] text-zinc-500',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div>
        {tab === 'partite' && <PartiteTab />}
        {tab === 'squadre' && <SquadreTab />}
        {tab === 'iscrizioni' && <IscrizioniTab regs={regs} />}
        {tab === 'moduli' && <ModuliTab registrations={regs.list} />}
        {tab === 'torneo' && (
          <TorneoTab
            canArchive={others.length > 0}
            onArchive={archive}
            onNewEdition={() => newEdition(data)}
            onDelete={() => setDeleteOpen(true)}
          />
        )}
        {tab === 'albo' && <AlboTab />}
        {tab === 'archivio' && <ArchivioTab onNewEdition={(t) => newEdition(t.data)} />}
        {tab === 'sito' && <SitoTab />}
      </div>

      {newOpen && (
        <NewTournamentModal
          onClose={() => setNewOpen(false)}
          takenSlugs={takenSlugs}
          current={data}
          onCreated={(slug) => go(slug, 'torneo')}
        />
      )}
      {deleteOpen && (
        <DeleteTournamentModal data={data} onClose={() => setDeleteOpen(false)} onConfirm={remove} />
      )}
    </div>
  );
}

/* archivio quando non c'è nessun torneo attivo (fuori dal TournamentProvider) */
function ArchivioTabStandalone({
  go,
  takenSlugs,
}: {
  go: (slug: string | undefined, tab?: 'torneo') => void;
  takenSlugs: string[];
}) {
  const { createTournament } = useTournamentsRegistry();
  const newEdition = (t: TournamentSummary) => {
    const slug = uniqueSlug(newEditionOf(t.data, '').info.name, takenSlugs);
    void createTournament(slug, newEditionOf(t.data, slug)).then(() => go(slug, 'torneo'));
  };
  return (
    <div className="flex flex-col gap-3">
      <span className="font-display text-xl uppercase text-white">Archivio</span>
      <ArchivioTab onNewEdition={newEdition} />
    </div>
  );
}

/* ---------- finestre: nuovo torneo, elimina torneo ---------- */

function NewTournamentModal({
  onClose,
  onCreated,
  takenSlugs,
  current,
}: {
  onClose: () => void;
  onCreated: (slug: string) => void;
  takenSlugs: string[];
  current?: TournamentData;
}) {
  const { createTournament } = useTournamentsRegistry();
  const [f, setF] = useState({ name: '', edition: 'I Edizione', brush: '', dates: '', place: '' });
  const [copyTeams, setCopyTeams] = useState(false);
  const [withForm, setWithForm] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const create = () => {
    if (!f.name.trim()) return setError('Il nome è obbligatorio.');
    const slug = uniqueSlug(f.name, takenSlugs);
    setSaving(true);
    createTournament(
      slug,
      createTournamentData(slug, {
        name: f.name.trim(),
        edition: f.edition.trim(),
        brush: f.brush.trim(),
        dates: f.dates.trim(),
        place: f.place.trim(),
        copyTeamsFrom: copyTeams ? current : undefined,
        withForm,
      }),
    )
      .then(() => {
        onClose();
        onCreated(slug);
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Errore di creazione')))
      .finally(() => setSaving(false));
  };

  const check = (on: boolean, set: (v: boolean) => void, label: string) => (
    <button type="button" onClick={() => set(!on)} className="flex items-center gap-3 text-left text-sm text-zinc-300">
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold text-[#0a0a0a]',
          on ? 'border-primary bg-primary' : 'border-white/25',
        )}
      >
        {on ? '✓' : ''}
      </span>
      {label}
    </button>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title="Nuovo torneo"
      footer={
        <>
          <Btn onClick={onClose}>Annulla</Btn>
          <Btn variant="primary" onClick={create} disabled={saving}>
            {saving ? 'Creazione…' : 'Crea torneo'}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nome *">
          <TextInput
            autoFocus
            value={f.name}
            onChange={(e) => {
              setF({ ...f, name: e.target.value });
              setError(null);
            }}
            placeholder="Es. Under 14 · 2026"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Edizione">
            <TextInput value={f.edition} onChange={(e) => setF({ ...f, edition: e.target.value })} />
          </Field>
          <Field label="Scritta a mano">
            <TextInput value={f.brush} onChange={(e) => setF({ ...f, brush: e.target.value })} placeholder="Calcio Tennis 2026" />
          </Field>
          <Field label="Date">
            <TextInput value={f.dates} onChange={(e) => setF({ ...f, dates: e.target.value })} placeholder="25 — 31 Luglio 2026" />
          </Field>
          <Field label="Luogo">
            <TextInput value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} />
          </Field>
        </div>
        <div className="mt-1 flex flex-col gap-2.5">
          {current && check(copyTeams, setCopyTeams, `Copia le squadre da "${current.info.name}"`)}
          {check(withForm, setWithForm, 'Crea subito un modulo di iscrizione (aperto)')}
        </div>
        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

function DeleteTournamentModal({
  data,
  onClose,
  onConfirm,
}: {
  data: TournamentData;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [text, setText] = useState('');
  const ok = text.trim().toUpperCase() === 'ELIMINA';
  const items = [
    `${data.teams.length} squadre`,
    `${data.matches.length} partite`,
    `${data.forms.length} moduli di iscrizione`,
    `${data.hallOfFame.length} edizioni dell'albo d'oro`,
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Elimina torneo"
      footer={
        <>
          <Btn onClick={onClose}>Annulla</Btn>
          <Btn
            disabled={!ok}
            onClick={onConfirm}
            className="border-transparent bg-red-500 text-white hover:bg-red-600 hover:text-white"
          >
            Elimina per sempre
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-zinc-300">
          Stai per eliminare <strong className="text-white">{data.info.name}</strong>. Verranno cancellati:
        </p>
        <ul className="flex flex-col gap-1.5 text-sm text-zinc-400">
          {items.map((x) => (
            <li key={x} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> {x}
            </li>
          ))}
        </ul>
        <p className="text-sm text-zinc-500">
          Le iscrizioni già ricevute restano nel database. Se vuoi conservare il torneo, usa "Chiudi e archivia".
        </p>
        <Field label="Scrivi ELIMINA per confermare">
          <TextInput value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        </Field>
      </div>
    </Modal>
  );
}
