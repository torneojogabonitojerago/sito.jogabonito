import { getSupabase, getWriteKey } from '@/lib/supabase';
import { isValidTournamentData, normalizeTournament, type TournamentData } from '@/data/tournament';

export interface TournamentRow {
  data: TournamentData;
  updatedAt: string;
}

export async function fetchTournament(slug: string): Promise<TournamentRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tournaments')
    .select('payload, updated_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data?.payload || !isValidTournamentData(data.payload)) return null;

  return {
    data: normalizeTournament(data.payload as Partial<TournamentData>, slug),
    updatedAt: data.updated_at as string,
  };
}

export async function saveTournament(slug: string, payload: TournamentData): Promise<string> {
  const writeKey = getWriteKey();
  if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

  const supabase = getSupabase();
  const { error } = await supabase.rpc('save_tournament', {
    p_write_key: writeKey,
    p_slug: slug,
    p_payload: payload,
  });

  if (error) throw error;

  const row = await fetchTournament(slug);
  return row?.updatedAt ?? new Date().toISOString();
}

export async function resetTournamentRemote(slug: string): Promise<void> {
  const writeKey = getWriteKey();
  if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

  const supabase = getSupabase();
  const { error } = await supabase.rpc('reset_tournament', { p_write_key: writeKey, p_slug: slug });
  if (error) throw error;
}

export function subscribeTournament(slug: string, onChange: (row: TournamentRow) => void): () => void {
  const supabase = getSupabase();

  const channel = supabase
    .channel(`tournament_changes_${slug}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tournaments', filter: `slug=eq.${slug}` },
      async () => {
        const row = await fetchTournament(slug);
        if (row) onChange(row);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
