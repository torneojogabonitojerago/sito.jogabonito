import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getSupabase, getWriteKey, isSupabaseConfigured } from '@/lib/supabase';
import { defaultData, type OpeningNight, type SiteState, type TournamentData } from '@/data/tournament';
import { getErrorMessage } from '@/lib/utils';

const LOCAL_DATA_PREFIX = 'torneo-patronale-data-v1:';

export interface TournamentSummary {
  slug: string;
  sport: string;
  name: string;
  siteState: SiteState;
  openingNight: OpeningNight;
  updatedAt: string;
}

interface RegistryValue {
  tournaments: TournamentSummary[];
  loading: boolean;
  error: string | null;
  usesSupabase: boolean;
  createTournament: (slug: string, payload: TournamentData) => Promise<void>;
  deleteTournament: (slug: string) => Promise<void>;
}

const RegistryCtx = createContext<RegistryValue | null>(null);

function loadLocalSummaries(): TournamentSummary[] {
  const summaries: TournamentSummary[] = [];
  const seenSlugs = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(LOCAL_DATA_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw) as TournamentData;
      const slug = key.slice(LOCAL_DATA_PREFIX.length);
      summaries.push({
        slug,
        sport: data.sport,
        name: data.info.name,
        siteState: data.siteState,
        openingNight: data.openingNight,
        updatedAt: new Date().toISOString(),
      });
      seenSlugs.add(slug);
    } catch {
      /* riga corrotta, ignorata */
    }
  }
  // Il torneo seed non è ancora stato salvato al primo avvio: lo mostro comunque.
  if (!seenSlugs.has(defaultData.slug)) {
    summaries.unshift({
      slug: defaultData.slug,
      sport: defaultData.sport,
      name: defaultData.info.name,
      siteState: defaultData.siteState,
      openingNight: defaultData.openingNight,
      updatedAt: new Date().toISOString(),
    });
  }
  return summaries;
}

async function fetchSummaries(): Promise<TournamentSummary[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tournaments')
    .select('slug, payload, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const payload = row.payload as TournamentData;
    return {
      slug: row.slug as string,
      sport: payload.sport,
      name: payload.info.name,
      siteState: payload.siteState,
      openingNight: payload.openingNight,
      updatedAt: row.updated_at as string,
    };
  });
}

export function TournamentsRegistryProvider({ children }: { children: ReactNode }) {
  const usesSupabase = isSupabaseConfigured();
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const task = usesSupabase ? fetchSummaries() : Promise.resolve(loadLocalSummaries());
    task
      .then((list) => {
        setTournaments(list);
        setError(null);
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Errore di caricamento')))
      .finally(() => setLoading(false));
  }, [usesSupabase]);

  useEffect(() => {
    load();
    if (!usesSupabase) return;

    const supabase = getSupabase();
    const channel = supabase
      .channel('tournaments_list_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, load)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [usesSupabase, load]);

  const createTournament = useCallback(
    async (slug: string, payload: TournamentData) => {
      if (!usesSupabase) {
        localStorage.setItem(`${LOCAL_DATA_PREFIX}${slug}`, JSON.stringify(payload));
        load();
        return;
      }

      const writeKey = getWriteKey();
      if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

      const supabase = getSupabase();
      const { error: rpcError } = await supabase.rpc('create_tournament', {
        p_write_key: writeKey,
        p_slug: slug,
        p_payload: payload,
      });
      if (rpcError) throw rpcError;
      load();
    },
    [usesSupabase, load],
  );

  const deleteTournament = useCallback(
    async (slug: string) => {
      if (!usesSupabase) {
        localStorage.removeItem(`${LOCAL_DATA_PREFIX}${slug}`);
        load();
        return;
      }

      const writeKey = getWriteKey();
      if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

      const supabase = getSupabase();
      const { error: rpcError } = await supabase.rpc('delete_tournament', {
        p_write_key: writeKey,
        p_slug: slug,
      });
      if (rpcError) throw rpcError;
      load();
    },
    [usesSupabase, load],
  );

  const value = useMemo<RegistryValue>(
    () => ({ tournaments, loading, error, usesSupabase, createTournament, deleteTournament }),
    [tournaments, loading, error, usesSupabase, createTournament, deleteTournament],
  );

  return <RegistryCtx.Provider value={value}>{children}</RegistryCtx.Provider>;
}

export function useTournamentsRegistry(): RegistryValue {
  const ctx = useContext(RegistryCtx);
  if (!ctx) throw new Error('useTournamentsRegistry deve essere usato dentro <TournamentsRegistryProvider>');
  return ctx;
}
