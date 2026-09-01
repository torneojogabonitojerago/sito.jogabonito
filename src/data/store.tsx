import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchTournament,
  resetTournamentRemote,
  saveTournament,
  subscribeTournament,
} from '@/data/tournament-api';
import { blankTournamentData, defaultData, isValidTournamentData, type TournamentData } from '@/data/tournament';
import { isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_PREFIX = 'torneo-patronale-data-v1';
const SAVE_DEBOUNCE_MS = 800;

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error' | 'local';

interface StoreValue {
  data: TournamentData;
  update: (fn: (d: TournamentData) => TournamentData) => void;
  setData: (d: TournamentData) => void;
  reset: () => void;
  syncStatus: SyncStatus;
  syncError: string | null;
  usesSupabase: boolean;
}

const StoreCtx = createContext<StoreValue | null>(null);

function seedFor(slug: string): TournamentData {
  return slug === defaultData.slug ? defaultData : blankTournamentData(slug, 'Torneo', 'Nuovo torneo');
}

function loadFromLocalStorage(slug: string): TournamentData {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${slug}`);
    if (!raw) return seedFor(slug);
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidTournamentData(parsed)) return seedFor(slug);
    return { ...seedFor(slug), ...parsed, slug };
  } catch {
    return seedFor(slug);
  }
}

function saveToLocalStorage(slug: string, data: TournamentData) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${slug}`, JSON.stringify(data));
  } catch {
    /* storage non disponibile */
  }
}

export function TournamentProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const usesSupabase = isSupabaseConfigured();
  const [data, setDataState] = useState<TournamentData>(() =>
    usesSupabase ? seedFor(slug) : loadFromLocalStorage(slug),
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(usesSupabase ? 'loading' : 'local');
  const [syncError, setSyncError] = useState<string | null>(null);

  const hydratedRef = useRef(!usesSupabase);
  const remoteVersionRef = useRef(0);
  const applyingRemoteRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyRemote = useCallback(
    (next: TournamentData, updatedAt: string) => {
      const ts = new Date(updatedAt).getTime();
      if (ts <= remoteVersionRef.current) return;
      remoteVersionRef.current = ts;
      applyingRemoteRef.current = true;
      setDataState(next);
      saveToLocalStorage(slug, next);
      setSyncStatus('synced');
      setSyncError(null);
      queueMicrotask(() => {
        applyingRemoteRef.current = false;
      });
    },
    [slug],
  );

  useEffect(() => {
    if (!usesSupabase) return;

    let cancelled = false;

    fetchTournament(slug)
      .then((row) => {
        if (cancelled) return;
        if (row) {
          applyRemote(row.data, row.updatedAt);
        } else {
          setSyncStatus('synced');
        }
        hydratedRef.current = true;
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        hydratedRef.current = true;
        setSyncStatus('error');
        setSyncError(err instanceof Error ? err.message : 'Errore di caricamento');
        setDataState(loadFromLocalStorage(slug));
      });

    return () => {
      cancelled = true;
    };
  }, [slug, usesSupabase, applyRemote]);

  useEffect(() => {
    if (!usesSupabase) return;
    return subscribeTournament(slug, ({ data: next, updatedAt }) => {
      applyRemote(next, updatedAt);
    });
  }, [slug, usesSupabase, applyRemote]);

  useEffect(() => {
    if (!usesSupabase) {
      saveToLocalStorage(slug, data);
      return;
    }

    if (!hydratedRef.current || applyingRemoteRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      setSyncStatus('syncing');
      setSyncError(null);

      saveTournament(slug, data)
        .then((updatedAt) => {
          remoteVersionRef.current = new Date(updatedAt).getTime();
          saveToLocalStorage(slug, data);
          setSyncStatus('synced');
        })
        .catch((err: unknown) => {
          saveToLocalStorage(slug, data);
          setSyncStatus('error');
          setSyncError(err instanceof Error ? err.message : 'Errore di salvataggio');
        });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [slug, data, usesSupabase]);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      update: (fn) => setDataState((prev) => fn(prev)),
      setData: (d) => setDataState(d),
      reset: () => {
        const blank = blankTournamentData(slug, data.sport, data.info.name);
        if (usesSupabase) {
          resetTournamentRemote(slug)
            .then(() => {
              remoteVersionRef.current = 0;
              localStorage.removeItem(`${STORAGE_PREFIX}:${slug}`);
              setDataState(blank);
              setSyncStatus('synced');
              setSyncError(null);
            })
            .catch((err: unknown) => {
              setSyncStatus('error');
              setSyncError(err instanceof Error ? err.message : 'Errore di ripristino');
            });
        } else {
          localStorage.removeItem(`${STORAGE_PREFIX}:${slug}`);
          setDataState(blank);
        }
      },
      syncStatus,
      syncError,
      usesSupabase,
    }),
    [slug, data, syncStatus, syncError, usesSupabase],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useTournament(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useTournament deve essere usato dentro <TournamentProvider>');
  return ctx;
}
