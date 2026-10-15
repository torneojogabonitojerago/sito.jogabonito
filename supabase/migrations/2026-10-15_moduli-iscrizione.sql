-- ============================================================
-- Moduli di iscrizione configurabili (redesign 2026)
-- Esegui in Supabase -> SQL Editor. Si può rilanciare senza danni.
-- ============================================================

-- Ogni iscrizione ricorda da quale modulo arriva e salva tutte le risposte.
ALTER TABLE public.team_registrations
  ADD COLUMN IF NOT EXISTS form_id text,
  ADD COLUMN IF NOT EXISTS answers jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Le funzioni list_registrations / update / delete restano le stesse:
-- list_registrations restituisce già tutte le colonne della tabella.

-- Fa vedere subito le colonne nuove all'API di Supabase.
NOTIFY pgrst, 'reload schema';
