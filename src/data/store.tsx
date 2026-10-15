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
import {
  blankTournamentData,
  defaultData,
  isValidTournamentData,
  normalizeTournament,
  type TournamentData,
} from '@/data/tournament';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getErrorMessage } from '@/lib/utils';

const STORAGE_PREFIX = 'torneo-patronale-data-v1';
const SAVE_DEBOUNCE_MS = 800;

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'synced' | 'error' | 'local';

interface StoreValue {
  data: TournamentData;
  update: (fn: (d: TournamentData) => TournamentData) => void;
  setData: (d: TournamentData) => void;
  reset: () => void;
  /** sostituisce i dati e li salva subito, senza aspettare il debounce */
  saveNow: (d: TournamentData) => Promise<void>;
  /** annulla il salvataggio in attesa (prima di eliminare il torneo) */
  discardPending: () => void;
  syncStatus: SyncStatus;
  /** ora dell'ultimo salvataggio riuscito */
  savedAt: Date | null;
  syncError: string | null;
  usesSupabase: boolean;
}

const StoreCtx = createContext<StoreValue | null>(null);

function seedFor(slug: string): TournamentData {
  return slug === defaultData.slug ? normalizeTournament(defaultData, slug) : blankTournamentData(slug, 'Torneo', 'Nuovo torneo');
}

function loadFromLocalStorage(slug: string): TournamentData {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${slug}`);
    if (!raw) return seedFor(slug);
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidTournamentData(parsed)) return seedFor(slug);
    return normalizeTournament({ ...seedFor(slug), ...parsed }, slug);
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
  /* ultimi dati arrivati dal database: non vanno mai rispediti indietro (un visitatore non deve scrivere) */
  const remoteDataRef = useRef<TournamentData | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* salvataggio in attesa del debounce: va eseguito subito se il torneo viene chiuso */
  const pendingSaveRef = useRef<(() => void) | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const applyRemote = useCallback(
    (next: TournamentData, updatedAt: string) => {
      const ts = new Date(updatedAt).getTime();
      if (ts <= remoteVersionRef.current) return;
      remoteVersionRef.current = ts;
      remoteDataRef.current = next;
      setDataState(next);
      saveToLocalStorage(slug, next);
      setSyncStatus('synced');
      setSyncError(null);
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
        setSyncError(getErrorMessage(err, 'Errore di caricamento'));
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

    if (!hydratedRef.current || data === remoteDataRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    const run = () => {
      pendingSaveRef.current = null;
      setSyncStatus('syncing');
      setSyncError(null);

      saveTournament(slug, data)
        .then((updatedAt) => {
          remoteVersionRef.current = new Date(updatedAt).getTime();
          saveToLocalStorage(slug, data);
          setSyncStatus('synced');
          setSavedAt(new Date());
        })
        .catch((err: unknown) => {
          saveToLocalStorage(slug, data);
          setSyncStatus('error');
          setSyncError(getErrorMessage(err, 'Errore di salvataggio'));
        });
    };
    pendingSaveRef.current = run;
    saveTimerRef.current = setTimeout(run, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [slug, data, usesSupabase]);

  // alla chiusura (cambio torneo, uscita dal pannello) non perdo l'ultima modifica
  useEffect(() => () => pendingSaveRef.current?.(), []);

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
              setSyncError(getErrorMessage(err, 'Errore di ripristino'));
            });
        } else {
          localStorage.removeItem(`${STORAGE_PREFIX}:${slug}`);
          setDataState(blank);
        }
      },
      saveNow: async (next) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        pendingSaveRef.current = null;
        setDataState(next);
        saveToLocalStorage(slug, next);
        if (!usesSupabase) return;
        setSyncStatus('syncing');
        const updatedAt = await saveTournament(slug, next);
        remoteVersionRef.current = new Date(updatedAt).getTime();
        setSyncStatus('synced');
        setSavedAt(new Date());
      },
      discardPending: () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        pendingSaveRef.current = null;
      },
      syncStatus,
      savedAt,
      syncError,
      usesSupabase,
    }),
    [slug, data, syncStatus, savedAt, syncError, usesSupabase],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useTournament(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useTournament deve essere usato dentro <TournamentProvider>');
  return ctx;
}
