import { useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { cn, getErrorMessage } from '@/lib/utils';
import { useTournamentsRegistry } from '@/data/tournaments-registry';
import { siteStateBadge } from '@/lib/site-state';
import { blankTournamentData, type SiteState } from '@/data/tournament';
import AdminGate, { inputCls, isAdminUnlocked } from '@/pages/admin/AdminGate';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function NewTournamentForm() {
  const { createTournament } = useTournamentsRegistry();
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(name);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sport.trim() || !effectiveSlug.trim()) {
      setError('Nome, sport e slug sono obbligatori.');
      return;
    }
    setError(null);
    setCreating(true);
    createTournament(effectiveSlug, blankTournamentData(effectiveSlug, sport.trim(), name.trim()))
      .then(() => {
        setName('');
        setSport('');
        setSlug('');
        setSlugTouched(false);
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Errore di creazione')))
      .finally(() => setCreating(false));
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-md border border-dashed border-primary/40 bg-primary/[0.03] p-5">
      <h3 className="font-display text-lg uppercase tracking-wide text-white">Nuovo torneo</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">Nome</span>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="es. Torneo Pallavolo" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">Sport</span>
          <input className={inputCls} value={sport} onChange={(e) => setSport(e.target.value)} placeholder="es. Pallavolo" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">Slug (URL)</span>
        <input
          className={inputCls}
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="pallavolo"
        />
      </label>
      {error && <p className="text-xs font-semibold uppercase tracking-widest text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={creating}
        className="font-display flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm uppercase tracking-widest text-white disabled:opacity-60"
      >
        <Plus className="h-4 w-4" /> {creating ? 'Creazione…' : 'Crea torneo'}
      </button>
    </form>
  );
}

function TournamentRow({
  slug,
  sport,
  name,
  siteState,
}: {
  slug: string;
  sport: string;
  name: string;
  siteState: SiteState;
}) {
  const { deleteTournament } = useTournamentsRegistry();
  const badge = siteStateBadge[siteState];
  const [deleting, setDeleting] = useState(false);

  const remove = () => {
    if (!window.confirm(`Eliminare definitivamente "${name}"? Tutti i dati (squadre, partite, iscrizioni) andranno persi.`)) return;
    setDeleting(true);
    deleteTournament(slug).catch(() => setDeleting(false));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-[#101010] p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest',
            badge.className,
          )}
        >
          <badge.icon className="h-3 w-3" />
          {badge.label}
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-zinc-500">{sport}</p>
          <p className="font-display text-lg uppercase tracking-wide text-white">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to={`/${slug}/admin`}
          className="flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-primary hover:text-primary"
        >
          Gestisci
        </Link>
        <Link
          to={`/${slug}`}
          className="rounded-sm p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          title="Vedi il sito"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
        <button
          onClick={remove}
          disabled={deleting}
          className="rounded-sm p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60"
          title="Elimina torneo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminHub() {
  const [unlocked, setUnlocked] = useState(() => isAdminUnlocked());
  const { tournaments, loading, error } = useTournamentsRegistry();

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-12">
      <h1 className="font-display title-glow text-4xl uppercase tracking-wide text-white sm:text-5xl">Tornei</h1>
      <p className="font-brush mt-1 text-2xl text-primary">gestione generale</p>

      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="text-sm text-zinc-500">Caricamento…</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : tournaments.length === 0 ? (
          <p className="text-sm text-zinc-500">Nessun torneo ancora creato.</p>
        ) : (
          tournaments.map((t) => <TournamentRow key={t.slug} {...t} />)
        )}
      </div>

      <div className="mt-8">
        <NewTournamentForm />
      </div>
    </div>
  );
}
