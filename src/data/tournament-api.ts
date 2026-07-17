import { getSupabase, getWriteKey } from '@/lib/supabase';
import { defaultData, isValidTournamentData, type TournamentData } from '@/data/tournament';

const ROW_ID = 'main';

export interface TournamentRow {
  data: TournamentData;
  updatedAt: string;
}

export async function fetchTournament(): Promise<TournamentRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tournament_data')
    .select('payload, updated_at')
    .eq('id', ROW_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data?.payload || !isValidTournamentData(data.payload)) return null;

  return {
    data: { ...defaultData, ...data.payload },
    updatedAt: data.updated_at as string,
  };
}

export async function saveTournament(payload: TournamentData): Promise<string> {
  const writeKey = getWriteKey();
  if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

  const supabase = getSupabase();
  const { error } = await supabase.rpc('save_tournament', {
    p_write_key: writeKey,
    p_payload: payload,
  });

  if (error) throw error;

  const row = await fetchTournament();
  return row?.updatedAt ?? new Date().toISOString();
}

export async function resetTournamentRemote(): Promise<void> {
  const writeKey = getWriteKey();
  if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

  const supabase = getSupabase();
  const { error } = await supabase.rpc('reset_tournament', { p_write_key: writeKey });
  if (error) throw error;
}

export function subscribeTournament(onChange: (row: TournamentRow) => void): () => void {
  const supabase = getSupabase();

  const channel = supabase
    .channel('tournament_data_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tournament_data', filter: `id=eq.${ROW_ID}` },
      async () => {
        const row = await fetchTournament();
        if (row) onChange(row);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
