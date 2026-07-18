import { Trophy, Medal, Award } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useTournament } from '@/data/store';

export default function AlboDoro() {
  const { data } = useTournament();
  const editions = data.hallOfFame;
  const showStats = data.showHistoricalStats !== false; // default to true
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Albo d'Oro" brush="storia delle vittorie" />

      <div className="space-y-8">
        {editions.map((edition, index) => (
          <div
            key={edition.year}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#101010] to-[#0a0a0a] p-6 sm:p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5" />
            
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-4xl uppercase tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,0,255,0.4)]">
                  {edition.year}
                </h3>
                <div className="flex gap-2">
                  {index === 0 && (
                    <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                      Edizione corrente
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                {/* Vincitore */}
                <div className="relative rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 text-center">
                  <div className="relative mx-auto mb-3 inline-block">
                    <Trophy className="h-12 w-12 text-primary drop-shadow-[0_0_15px_rgba(255,0,255,0.6)]" />
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                  </div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-primary">Campione</p>
                  <p className="font-display text-xl uppercase tracking-wide text-white">{edition.winner}</p>
                </div>

                {/* Secondo */}
                <div className="relative rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 text-center">
                  <div className="relative mx-auto mb-3 inline-block">
                    <Medal className="h-12 w-12 text-zinc-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                    <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
                  </div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Secondo</p>
                  <p className="font-display text-xl uppercase tracking-wide text-white">{edition.runnerUp}</p>
                </div>

                {/* Terzo */}
                <div className="relative rounded-lg border border-amber-700/30 bg-gradient-to-br from-amber-700/10 to-transparent p-5 text-center">
                  <div className="relative mx-auto mb-3 inline-block">
                    <Award className="h-12 w-12 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" />
                    <div className="absolute inset-0 rounded-full bg-amber-600/20 blur-xl" />
                  </div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-amber-600">Terzo</p>
                  <p className="font-display text-xl uppercase tracking-wide text-white">{edition.thirdPlace}</p>
                </div>
              </div>

              {/* MVP e Top Scorer */}
              {(edition.mvp || edition.topScorer) && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {edition.mvp && (
                    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-4">
                      <div className="relative">
                        <Trophy className="h-6 w-6 text-primary" />
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">MVP</p>
                        <p className="font-display text-sm uppercase tracking-wide text-white">{edition.mvp}</p>
                      </div>
                    </div>
                  )}
                  {edition.topScorer && (
                    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-4">
                      <div className="relative">
                        <Award className="h-6 w-6 text-cyan-400" />
                        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-lg" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Top Scorer</p>
                        <p className="font-display text-sm uppercase tracking-wide text-white">{edition.topScorer}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Statistiche generali */}
      {showStats && (
        <div className="mt-12 rounded-xl border border-white/10 bg-gradient-to-br from-[#101010] to-[#0a0a0a] p-6 sm:p-8">
          <h3 className="mb-6 font-display text-2xl uppercase tracking-wide text-white">Statistiche storiche</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">{editions.length}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Edizioni</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                {editions.reduce((sum, e) => sum + (e.matchesPlayed || 0), 0)}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Partite giocate</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-white">
                {editions.reduce((sum, e) => sum + (e.totalGoals || 0), 0)}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Goal totali</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                {new Set(editions.map(e => e.winner)).size}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Squadre vincitrici</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
