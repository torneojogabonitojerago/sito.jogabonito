import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getSupabase, getWriteKey, isSupabaseConfigured } from '@/lib/supabase';
import { getErrorMessage } from '@/lib/utils';
import type { SiteMode } from '@/lib/site-state';

/* ============================================================
   CONFIGURAZIONE GLOBALE DEL SITO (home, modalità, intro).
   Su Supabase è una riga speciale della tabella "tournaments"
   (slug SITE_SLUG), così riusa le funzioni di salvataggio esistenti.
   ============================================================ */

export const SITE_SLUG = '__site';
const LOCAL_KEY = 'torneo-site-config-v1';
const SAVE_DEBOUNCE_MS = 800;

export interface SiteHome {
  badge: string;
  title1: string;
  title2: string;
  brush: string;
  /** vuoto = luogo del torneo in evidenza */
  place: string;
  /** inizio torneo per il countdown, formato datetime-local; vuoto = prima partita in calendario */
  start: string;
}

export interface SiteConfig {
  home: SiteHome;
  /** null = ricavata dagli stati dei tornei */
  mode: SiteMode | null;
  intro: boolean;
}

export const defaultSiteConfig: SiteConfig = {
  home: {
    badge: 'Festa Patronale',
    title1: 'Torneo',
    title2: 'Patronale',
    brush: 'Joga Bonito 2026',
    place: '',
    start: '',
  },
  mode: null,
  intro: true,
};

function normalize(raw: unknown): SiteConfig {
  const v = (raw && typeof raw === 'object' ? raw : {}) as Partial<SiteConfig>;
  return {
    home: { ...defaultSiteConfig.home, ...(v.home ?? {}) },
    mode: v.mode === 'pre' || v.mode === 'live' || v.mode === 'post' ? v.mode : null,
    intro: v.intro !== false,
  };
}

/** Ultima configurazione vista: serve all'intro per decidere subito se partire. */
export function cachedSiteConfig(): SiteConfig {
  try {
    return normalize(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? 'null'));
  } catch {
    return defaultSiteConfig;
  }
}

function cache(config: SiteConfig) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(config));
  } catch {
    /* storage non disponibile */
  }
}

async function fetchRemote(): Promise<SiteConfig | null> {
  const { data, error } = await getSupabase()
    .from('tournaments')
    .select('payload')
    .eq('slug', SITE_SLUG)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data.payload) : null;
}

async function saveRemote(config: SiteConfig): Promise<void> {
  const writeKey = getWriteKey();
  if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');
  const { error } = await getSupabase().rpc('save_tournament', {
    p_write_key: writeKey,
    p_slug: SITE_SLUG,
    p_payload: config,
  });
  if (error) throw error;
}

interface SiteConfigValue {
  config: SiteConfig;
  loaded: boolean;
  update: (fn: (c: SiteConfig) => SiteConfig) => void;
  saving: boolean;
  saveError: string | null;
}

const SiteConfigCtx = createContext<SiteConfigValue | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const usesSupabase = isSupabaseConfigured();
  const [config, setConfig] = useState<SiteConfig>(cachedSiteConfig);
  const [loaded, setLoaded] = useState(!usesSupabase);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!usesSupabase) return;
    let cancelled = false;
    const load = () =>
      fetchRemote()
        .then((remote) => {
          if (cancelled) return;
          const next = remote ?? defaultSiteConfig;
          setConfig(next);
          cache(next);
        })
        .catch(() => {
          /* resta la copia locale */
        })
        .finally(() => !cancelled && setLoaded(true));

    void load();
    const supabase = getSupabase();
    const channel = supabase
      .channel('site_config_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments', filter: `slug=eq.${SITE_SLUG}` },
        () => void load(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [usesSupabase]);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const update = useCallback(
    (fn: (c: SiteConfig) => SiteConfig) => {
      const next = fn(configRef.current);
      configRef.current = next;
      setConfig(next);
      cache(next);
      if (!usesSupabase) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setSaving(true);
        setSaveError(null);
        saveRemote(next)
          .catch((err: unknown) => setSaveError(getErrorMessage(err, 'Errore di salvataggio')))
          .finally(() => setSaving(false));
      }, SAVE_DEBOUNCE_MS);
    },
    [usesSupabase],
  );

  const value = useMemo(
    () => ({ config, loaded, update, saving, saveError }),
    [config, loaded, update, saving, saveError],
  );

  return <SiteConfigCtx.Provider value={value}>{children}</SiteConfigCtx.Provider>;
}

export function useSiteConfig(): SiteConfigValue {
  const ctx = useContext(SiteConfigCtx);
  if (!ctx) throw new Error('useSiteConfig deve essere usato dentro <SiteConfigProvider>');
  return ctx;
}
