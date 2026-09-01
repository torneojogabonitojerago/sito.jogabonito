import { Outlet, useParams, Link } from 'react-router';
import { TournamentProvider } from '@/data/store';
import { useTournamentsRegistry } from '@/data/tournaments-registry';

export default function TournamentRoute() {
  const { slug } = useParams<{ slug: string }>();
  const { tournaments, loading } = useTournamentsRegistry();

  if (!slug) return null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-16 text-sm text-zinc-500">
        Caricamento…
      </div>
    );
  }

  const exists = tournaments.some((t) => t.slug === slug);
  if (!exists) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 pt-16 text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide text-white">Torneo non trovato</h1>
        <p className="text-sm text-zinc-500">Il torneo "{slug}" non esiste o è stato rimosso.</p>
        <Link to="/" className="text-sm font-bold uppercase tracking-widest text-primary hover:underline">
          ← Torna alla lista tornei
        </Link>
      </div>
    );
  }

  return (
    <TournamentProvider slug={slug} key={slug}>
      <Outlet />
    </TournamentProvider>
  );
}
