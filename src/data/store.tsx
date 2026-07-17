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
import { defaultData, isValidTournamentData, type TournamentData } from '@/data/tournament';
import { isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'torneo-patronale-data-v1';
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

function loadFromLocalStorage(): TournamentData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidTournamentData(parsed)) return defaultData;
    return { ...defaultData, ...parsed };
  } catch {
    return defaultData;
  }
}

function saveToLocalStorage(data: TournamentData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage non disponibile */
  }
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const usesSupabase = isSupabaseConfigured();
  const [data, setDataState] = useState<TournamentData>(() =>
    usesSupabase ? defaultData : loadFromLocalStorage(),
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(usesSupabase ? 'loading' : 'local');
  const [syncError, setSyncError] = useState<string | null>(null);

  const hydratedRef = useRef(!usesSupabase);
  const remoteVersionRef = useRef(0);
  const applyingRemoteRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyRemote = useCallback((next: TournamentData, updatedAt: string) => {
    const ts = new Date(updatedAt).getTime();
    if (ts <= remoteVersionRef.current) return;
    remoteVersionRef.current = ts;
    applyingRemoteRef.current = true;
    setDataState(next);
    saveToLocalStorage(next);
    setSyncStatus('synced');
    setSyncError(null);
    queueMicrotask(() => {
      applyingRemoteRef.current = false;
    });
  }, []);

  useEffect(() => {
    if (!usesSupabase) return;

    let cancelled = false;

    fetchTournament()
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
        setDataState(loadFromLocalStorage());
      });

    return () => {
      cancelled = true;
    };
  }, [usesSupabase, applyRemote]);

  useEffect(() => {
    if (!usesSupabase) return;
    return subscribeTournament(({ data: next, updatedAt }) => {
      applyRemote(next, updatedAt);
    });
  }, [usesSupabase, applyRemote]);

  useEffect(() => {
    if (!usesSupabase) {
      saveToLocalStorage(data);
      return;
    }

    if (!hydratedRef.current || applyingRemoteRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      setSyncStatus('syncing');
      setSyncError(null);

      saveTournament(data)
        .then((updatedAt) => {
          remoteVersionRef.current = new Date(updatedAt).getTime();
          saveToLocalStorage(data);
          setSyncStatus('synced');
        })
        .catch((err: unknown) => {
          saveToLocalStorage(data);
          setSyncStatus('error');
          setSyncError(err instanceof Error ? err.message : 'Errore di salvataggio');
        });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, usesSupabase]);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      update: (fn) => setDataState((prev) => fn(prev)),
      setData: (d) => setDataState(d),
      reset: () => {
        if (usesSupabase) {
          resetTournamentRemote()
            .then(() => {
              remoteVersionRef.current = 0;
              localStorage.removeItem(STORAGE_KEY);
              setDataState(defaultData);
              setSyncStatus('synced');
              setSyncError(null);
            })
            .catch((err: unknown) => {
              setSyncStatus('error');
              setSyncError(err instanceof Error ? err.message : 'Errore di ripristino');
            });
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setDataState(defaultData);
        }
      },
      syncStatus,
      syncError,
      usesSupabase,
    }),
    [data, syncStatus, syncError, usesSupabase],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useTournament(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useTournament deve essere usato dentro <TournamentProvider>');
  return ctx;
}
