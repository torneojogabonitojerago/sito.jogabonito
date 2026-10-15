import { Outlet, useParams, Link } from 'react-router';
import { TournamentProvider } from '@/data/store';
import { useTournamentsRegistry } from '@/data/tournaments-registry';

export default function TournamentRoute() {
  const { slug } = useParams<{ slug: string }>();
  const { tournaments, loading } = useTournamentsRegistry();

  if (!slug) return null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-zinc-500">Caricamento…</div>
    );
  }

  const exists = tournaments.some((t) => t.slug === slug);
  if (!exists) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-glow text-[clamp(40px,6vw,72px)] uppercase leading-none text-white">
          Torneo non trovato
        </h1>
        <p className="font-brush text-[28px] text-cyan-400">fuori dal campo</p>
        <p className="text-sm text-zinc-500">Il torneo "{slug}" non esiste o è stato rimosso.</p>
        <Link to="/" className="btn-ghost mt-2 px-[22px] py-[13px] text-[15px]">
          ← Torna alla home
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
