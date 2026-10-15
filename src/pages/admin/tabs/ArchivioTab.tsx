import { useState } from 'react';
import { Link } from 'react-router';
import { CopyPlus, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { useTournamentsRegistry, type TournamentSummary } from '@/data/tournaments-registry';
import { championOf, tournamentYear } from '@/data/tournament';
import { getErrorMessage } from '@/lib/utils';
import { Btn } from '../ui';
import { restoreTournament } from '../tournament-ops';

export default function ArchivioTab({ onNewEdition }: { onNewEdition: (src: TournamentSummary) => void }) {
  const { archived, updateTournament, deleteTournament } = useTournamentsRegistry();
  const [armed, setArmed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (task: Promise<void>) => {
    setError(null);
    task.catch((err: unknown) => setError(getErrorMessage(err, 'Operazione non riuscita')));
  };

  if (archived.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-white/[0.12] p-10 text-center text-zinc-400">
        Nessun torneo archiviato. Da "Torneo → Fine torneo" puoi chiudere e archiviare quello in corso.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
      {archived.map((t) => (
        <div
          key={t.slug}
          className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-amber-500/25 bg-[linear-gradient(160deg,#100c04,#0a0a0a_65%)] p-4"
        >
          <div className="flex min-w-0 items-center gap-4">
            <span className="font-display text-4xl leading-none text-amber-400">{tournamentYear(t.data)}</span>
            <div className="min-w-0">
              <p className="truncate font-display text-xl uppercase text-white">{t.name}</p>
              <p className="text-xs font-semibold text-zinc-500">
                Campione: <span className="text-amber-400">{championOf(t.data)}</span>
                {t.data.archivedAt && ` · archiviato il ${new Date(t.data.archivedAt).toLocaleDateString('it-IT')}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Link
              to={`/archivio/${t.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 font-display text-xs uppercase tracking-[0.1em] text-zinc-200 transition-colors hover:border-primary hover:text-primary"
            >
              <Eye className="h-3.5 w-3.5" /> Vedi
            </Link>
            <Btn small onClick={() => run(updateTournament(t.slug, restoreTournament(t.data)))}>
              <RotateCcw className="h-3.5 w-3.5" /> Ripristina
            </Btn>
            <Btn small onClick={() => onNewEdition(t)}>
              <CopyPlus className="h-3.5 w-3.5" /> Nuova edizione
            </Btn>
            <Btn
              small
              variant="danger"
              onClick={() => {
                if (armed !== t.slug) return setArmed(t.slug);
                setArmed(null);
                run(deleteTournament(t.slug));
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> {armed === t.slug ? 'Conferma eliminazione' : 'Elimina'}
            </Btn>
          </div>
        </div>
      ))}
    </div>
  );
}
