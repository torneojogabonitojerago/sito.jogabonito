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

-- ============================================================
-- 5. Iscrizioni squadre (form pubblico "PRE-SEASON")
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.team_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  players_count int,
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_registrations ENABLE ROW LEVEL SECURITY;

-- Chiunque può inviare una richiesta di iscrizione (form pubblico)
DROP POLICY IF EXISTS "Iscrizione pubblica" ON public.team_registrations;
CREATE POLICY "Iscrizione pubblica"
  ON public.team_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Nessuna lettura/scrittura diretta: solo tramite funzioni RPC protette da chiave
-- (stessa VITE_SUPABASE_WRITE_KEY usata per save_tournament/reset_tournament)

CREATE OR REPLACE FUNCTION public.list_registrations(p_write_key text)
RETURNS SETOF public.team_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  RETURN QUERY SELECT * FROM public.team_registrations ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_registration_status(p_write_key text, p_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;
  IF p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Stato non valido';
  END IF;

  UPDATE public.team_registrations SET status = p_status WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_registration(p_write_key text, p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  DELETE FROM public.team_registrations WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_registrations(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_registration_status(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_registration(text, uuid) TO anon, authenticated;

ALTER TABLE public.team_registrations REPLICA IDENTITY FULL;

-- Abilita Realtime dalla dashboard Supabase (facoltativo, per aggiornamenti live in admin):
-- Database → Replication → supabase_realtime → attiva team_registrations

-- ============================================================
-- 6. Multi-torneo — il sito ospita più tornei in parallelo,
--    ognuno con il proprio slug (es. /calcio-tennis, /pallavolo).
-- ============================================================

-- Le funzioni sotto vengono ridefinite con una firma diversa (in più: lo slug).
-- Tolgo prima le vecchie versioni per non lasciare doppioni in giro.
DROP FUNCTION IF EXISTS public.save_tournament(text, jsonb);
DROP FUNCTION IF EXISTS public.reset_tournament(text);
DROP FUNCTION IF EXISTS public.list_registrations(text);
DROP FUNCTION IF EXISTS public.update_registration_status(text, uuid, text);
DROP FUNCTION IF EXISTS public.delete_registration(text, uuid);

-- Una riga per torneo (slug = identificativo nell'URL, es. 'calcio-tennis')
CREATE TABLE IF NOT EXISTS public.tournaments (
  slug text PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lettura pubblica tornei" ON public.tournaments;
CREATE POLICY "Lettura pubblica tornei"
  ON public.tournaments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Migrazione: porta il torneo esistente (tabella tournament_data, id='main')
-- sotto lo slug 'calcio-tennis' così tutti i dati già inseriti restano intatti.
-- Se non avevi mai salvato nulla da admin, questa riga non trova nulla da copiare:
-- in quel caso crea il primo torneo dalla pagina /admin dopo aver eseguito lo script.
INSERT INTO public.tournaments (slug, payload, updated_at)
SELECT 'calcio-tennis', payload, updated_at
FROM public.tournament_data
WHERE id = 'main'
ON CONFLICT (slug) DO NOTHING;

-- Funzione di salvataggio (upsert) — sostituisce i dati di un torneo esistente
CREATE OR REPLACE FUNCTION public.save_tournament(p_write_key text, p_slug text, p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  INSERT INTO public.tournaments (slug, payload, updated_at)
  VALUES (p_slug, p_payload, now())
  ON CONFLICT (slug) DO UPDATE
  SET payload = EXCLUDED.payload,
      updated_at = EXCLUDED.updated_at;
END;
$$;

-- Crea un torneo nuovo — fallisce se lo slug esiste già
CREATE OR REPLACE FUNCTION public.create_tournament(p_write_key text, p_slug text, p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tournaments WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'Slug già in uso';
  END IF;

  INSERT INTO public.tournaments (slug, payload, updated_at)
  VALUES (p_slug, p_payload, now());
END;
$$;

-- Elimina un torneo definitivamente (usato da "Elimina torneo" nell'hub admin)
CREATE OR REPLACE FUNCTION public.delete_tournament(p_write_key text, p_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  DELETE FROM public.tournaments WHERE slug = p_slug;
END;
$$;

-- Ripristina un torneo ai dati di partenza (usato da "Ripristina dati iniziali" in admin)
CREATE OR REPLACE FUNCTION public.reset_tournament(p_write_key text, p_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  DELETE FROM public.tournaments WHERE slug = p_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_tournament(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_tournament(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_tournament(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_tournament(text, text) TO anon, authenticated;

ALTER TABLE public.tournaments REPLICA IDENTITY FULL;

-- Abilita Realtime dalla dashboard Supabase:
-- Database → Replication → supabase_realtime → attiva tournaments

-- Le iscrizioni diventano scoped per torneo
ALTER TABLE public.team_registrations
  ADD COLUMN IF NOT EXISTS tournament_slug text NOT NULL DEFAULT 'calcio-tennis';

CREATE OR REPLACE FUNCTION public.list_registrations(p_write_key text, p_slug text)
RETURNS SETOF public.team_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  RETURN QUERY
    SELECT * FROM public.team_registrations
    WHERE tournament_slug = p_slug
    ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_registration_status(p_write_key text, p_slug text, p_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;
  IF p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Stato non valido';
  END IF;

  UPDATE public.team_registrations
  SET status = p_status
  WHERE id = p_id AND tournament_slug = p_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_registration(p_write_key text, p_slug text, p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_write_key IS NULL OR p_write_key <> 'patronalejocabonito' THEN
    RAISE EXCEPTION 'Chiave di scrittura non valida';
  END IF;

  DELETE FROM public.team_registrations WHERE id = p_id AND tournament_slug = p_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_registrations(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_registration_status(text, text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_registration(text, text, uuid) TO anon, authenticated;

-- La vecchia tabella tournament_data resta al suo posto (non la cancello):
-- superata ma innocua. Puoi eliminarla tu manualmente quando sarai sicuro
-- che il nuovo hub multi-torneo funziona correttamente.
