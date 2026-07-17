import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL?.trim() &&
      import.meta.env.VITE_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getWriteKey(): string | null {
  const key = import.meta.env.VITE_SUPABASE_WRITE_KEY?.trim();
  return key || null;
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase non configurato: imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  }
  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
  }
  return client;
}
