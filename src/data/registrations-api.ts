import { getSupabase, getWriteKey, isSupabaseConfigured } from '@/lib/supabase';
import type { RegistrationInput, RegistrationStatus, TeamRegistration } from '@/data/registrations';

const LOCAL_PREFIX = 'torneo-patronale-registrations-v1';

function loadLocal(slug: string): TeamRegistration[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_PREFIX}:${slug}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as TeamRegistration[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(slug: string, list: TeamRegistration[]) {
  try {
    localStorage.setItem(`${LOCAL_PREFIX}:${slug}`, JSON.stringify(list));
  } catch {
    /* storage non disponibile */
  }
}

interface RegistrationRow {
  id: string;
  team_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  players_count: number | null;
  notes: string;
  status: RegistrationStatus;
  created_at: string;
}

function fromRow(row: RegistrationRow): TeamRegistration {
  return {
    id: row.id,
    teamName: row.team_name,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    playersCount: row.players_count,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function submitRegistration(slug: string, input: RegistrationInput): Promise<void> {
  if (!isSupabaseConfigured()) {
    const list = loadLocal(slug);
    list.unshift({
      id: `local-${Date.now()}`,
      ...input,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    saveLocal(slug, list);
    return;
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('team_registrations').insert({
    tournament_slug: slug,
    team_name: input.teamName,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    contact_email: input.contactEmail,
    players_count: input.playersCount,
    notes: input.notes,
  });
  if (error) throw error;
}

export async function listRegistrations(slug: string): Promise<TeamRegistration[]> {
  if (!isSupabaseConfigured()) return loadLocal(slug);

  const writeKey = getWriteKey();
  if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('list_registrations', {
    p_write_key: writeKey,
    p_slug: slug,
  });
  if (error) throw error;
  return ((data ?? []) as RegistrationRow[]).map(fromRow);
}

export async function updateRegistrationStatus(slug: string, id: string, status: RegistrationStatus): Promise<void> {
  if (!isSupabaseConfigured()) {
    saveLocal(slug, loadLocal(slug).map((r) => (r.id === id ? { ...r, status } : r)));
    return;
  }

  const writeKey = getWriteKey();
  if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

  const supabase = getSupabase();
  const { error } = await supabase.rpc('update_registration_status', {
    p_write_key: writeKey,
    p_slug: slug,
    p_id: id,
    p_status: status,
  });
  if (error) throw error;
}

export async function deleteRegistration(slug: string, id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    saveLocal(slug, loadLocal(slug).filter((r) => r.id !== id));
    return;
  }

  const writeKey = getWriteKey();
  if (!writeKey) throw new Error('VITE_SUPABASE_WRITE_KEY non configurata');

  const supabase = getSupabase();
  const { error } = await supabase.rpc('delete_registration', {
    p_write_key: writeKey,
    p_slug: slug,
    p_id: id,
  });
  if (error) throw error;
}

export function subscribeRegistrations(slug: string, onChange: () => void): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const supabase = getSupabase();
  const channel = supabase
    .channel(`team_registrations_changes_${slug}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'team_registrations', filter: `tournament_slug=eq.${slug}` },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
