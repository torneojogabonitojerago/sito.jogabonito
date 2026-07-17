-- ============================================================
-- Schema Supabase per Torneo Patronale
-- Esegui questo script in Supabase → SQL Editor
-- ============================================================

-- 1. Tabella dati torneo (un solo record con id = 'main')
CREATE TABLE IF NOT EXISTS public.tournament_data (
  id text PRIMARY KEY DEFAULT 'main',
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_data ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica (tutti i visitatori del sito)
DROP POLICY IF EXISTS "Lettura pubblica torneo" ON public.tournament_data;
CREATE POLICY "Lettura pubblica torneo"
  ON public.tournament_data
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Nessuna scrittura diretta: solo tramite funzioni RPC protette da chiave

-- 2. Funzione di salvataggio (solo admin con chiave corretta)
-- ⚠️ SOSTITUISCI 'patronale2026-scrivi-qui' con una chiave segreta a tua scelta
--    La stessa chiave va in Vercel come VITE_SUPABASE_WRITE_KEY
CREATE OR REPLACE FUNCTION public.save_tournament(p_write_key text, p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  INSERT INTO public.tournament_data (id, payload, updated_at)
  VALUES ('main', p_payload, now())
  ON CONFLICT (id) DO UPDATE
  SET payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at;
END;
$$;

-- 3. Funzione di ripristino (cancella i dati salvati → torna ai default del codice)
CREATE OR REPLACE FUNCTION public.reset_tournament(p_write_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  DELETE FROM public.tournament_data WHERE id = 'main';
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_tournament(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_tournament(text) TO anon, authenticated;

-- 4. Realtime (aggiornamenti live per tutti i visitatori)
ALTER TABLE public.tournament_data REPLICA IDENTITY FULL;

-- Abilita Realtime dalla dashboard Supabase:
-- Database → Replication → supabase_realtime → attiva tournament_data
