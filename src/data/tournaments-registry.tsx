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
import {
  defaultData,
  normalizeTournament,
  type OpeningNight,
  type SiteState,
  type TournamentData,
} from '@/data/tournament';
import { getErrorMessage } from '@/lib/utils';
import { saveTournament } from '@/data/tournament-api';
import { SITE_SLUG } from '@/data/site-config';

const LOCAL_DATA_PREFIX = 'torneo-patronale-data-v1:';

export interface TournamentSummary {
  slug: string;
  sport: string;
  name: string;
  siteState: SiteState;
  openingNight: OpeningNight;
  updatedAt: string;
  /** Dati completi del torneo (servono alla home per capolista, partite, campioni) */
  data: TournamentData;
}

interface RegistryValue {
  /** tornei attivi (non archiviati) */
  tournaments: TournamentSummary[];
  /** tornei archiviati, dal più recente */
  archived: TournamentSummary[];
  loading: boolean;
  error: string | null;
  usesSupabase: boolean;
  createTournament: (slug: string, payload: TournamentData) => Promise<void>;
  deleteTournament: (slug: string) => Promise<void>;
  /** ricarica l'elenco dei tornei */
  reload: () => void;
  /** salva i dati di un torneo qualsiasi (archiviazione, ripristino…) */
  updateTournament: (slug: string, payload: TournamentData) => Promise<void>;
}

const RegistryCtx = createContext<RegistryValue | null>(null);

function toSummary(slug: string, payload: Partial<TournamentData>, updatedAt: string): TournamentSummary {
  const data = normalizeTournament(payload, slug);
  return {
    slug,
    sport: data.sport,
    name: data.info.name,
    siteState: data.siteState,
    openingNight: data.openingNight,
    updatedAt,
    data,
  };
}

function loadLocalSummaries(): TournamentSummary[] {
  const summaries: TournamentSummary[] = [];
  const seenSlugs = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(LOCAL_DATA_PREFIX) || key === LOCAL_DATA_PREFIX + SITE_SLUG) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw) as TournamentData;
      const slug = key.slice(LOCAL_DATA_PREFIX.length);
      summaries.push(toSummary(slug, data, new Date().toISOString()));
      seenSlugs.add(slug);
    } catch {
      /* riga corrotta, ignorata */
    }
  }
  // Il torneo seed non è ancora stato salvato al primo avvio: lo mostro comunque.
  if (!seenSlugs.has(defaultData.slug)) {
    summaries.unshift(toSummary(defaultData.slug, defaultData, new Date().toISOString()));
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

  return (data ?? [])
    .filter((row) => row.slug !== SITE_SLUG)
    .map((row) => toSummary(row.slug as string, row.payload as Partial<TournamentData>, row.updated_at as string));
}

export function TournamentsRegistryProvider({ children }: { children: ReactNode }) {
  const usesSupabase = isSupabaseConfigured();
  const [all, setAll] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const task = usesSupabase ? fetchSummaries() : Promise.resolve(loadLocalSummaries());
    task
      .then((list) => {
        setAll(list);
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

  const updateTournament = useCallback(
    async (slug: string, payload: TournamentData) => {
      if (!usesSupabase) {
        localStorage.setItem(`${LOCAL_DATA_PREFIX}${slug}`, JSON.stringify(payload));
      } else {
        await saveTournament(slug, payload);
      }
      load();
    },
    [usesSupabase, load],
  );

  const value = useMemo<RegistryValue>(() => {
    const byName = (a: TournamentSummary, b: TournamentSummary) => a.name.localeCompare(b.name);
    return {
      tournaments: all.filter((t) => !t.data.archived).sort(byName),
      archived: all
        .filter((t) => t.data.archived)
        .sort((a, b) => (b.data.archivedAt ?? '').localeCompare(a.data.archivedAt ?? '')),
      loading,
      error,
      usesSupabase,
      createTournament,
      deleteTournament,
      updateTournament,
      reload: load,
    };
  }, [all, loading, error, usesSupabase, createTournament, deleteTournament, updateTournament, load]);

  return <RegistryCtx.Provider value={value}>{children}</RegistryCtx.Provider>;
}

/** Torneo di riferimento quando l'URL non ne indica uno: prima quello con una partita in campo,
    poi quello con le iscrizioni aperte, poi il primo. */
export function pickFeatured(list: TournamentSummary[]): TournamentSummary | undefined {
  return (
    list.find((t) => t.data.matches.some((m) => m.status === 'live')) ??
    list.find((t) => t.data.forms.some((f) => f.open)) ??
    list[0]
  );
}

export function useTournamentsRegistry(): RegistryValue {
  const ctx = useContext(RegistryCtx);
  if (!ctx) throw new Error('useTournamentsRegistry deve essere usato dentro <TournamentsRegistryProvider>');
  return ctx;
}
