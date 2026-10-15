import { getSupabase, getWriteKey, isSupabaseConfigured } from '@/lib/supabase';
import type {
  RegistrationAnswer,
  RegistrationInput,
  RegistrationStatus,
  TeamRegistration,
} from '@/data/registrations';

const LOCAL_PREFIX = 'torneo-patronale-registrations-v1';

function loadLocal(slug: string): TeamRegistration[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_PREFIX}:${slug}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // le iscrizioni salvate col vecchio form fisso non hanno le risposte
    return (parsed as (TeamRegistration & { teamName?: string })[]).map((r) =>
      Array.isArray(r.answers)
        ? r
        : { ...r, formId: null, title: r.teamName ?? '', answers: [{ label: 'Nome squadra', value: r.teamName ?? '' }] },
    );
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
  /* colonne aggiunte con i moduli configurabili (possono mancare se lo SQL non è stato lanciato) */
  form_id?: string | null;
  answers?: RegistrationAnswer[] | null;
}

function fromRow(row: RegistrationRow): TeamRegistration {
  const answers =
    row.answers && row.answers.length > 0
      ? row.answers
      : [
          { label: 'Nome squadra', value: row.team_name },
          { label: 'Referente', value: row.contact_name },
          { label: 'Telefono', value: row.contact_phone },
          { label: 'Email', value: row.contact_email },
          { label: 'Numero giocatori', value: row.players_count ? String(row.players_count) : '' },
          { label: 'Note', value: row.notes },
        ].filter((a) => a.value);
  return {
    id: row.id,
    formId: row.form_id ?? null,
    title: row.team_name,
    answers,
    status: row.status,
    createdAt: row.created_at,
  };
}

const answerOfType = (input: RegistrationInput, type: string) =>
  input.answers.find((a) => a.type === type && a.value)?.value ?? '';

/** Errore di PostgREST quando una colonna non esiste (SQL dei moduli non ancora eseguito). */
const isMissingColumn = (err: { code?: string; message?: string }) =>
  err.code === 'PGRST204' || /column/i.test(err.message ?? '');

export async function submitRegistration(slug: string, input: RegistrationInput): Promise<void> {
  if (!isSupabaseConfigured()) {
    const list = loadLocal(slug);
    list.unshift({
      id: `local-${Date.now()}`,
      formId: input.formId,
      title: input.title,
      answers: input.answers,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    saveLocal(slug, list);
    return;
  }

  const base = {
    tournament_slug: slug,
    team_name: input.title,
    contact_phone: answerOfType(input, 'tel'),
    contact_email: answerOfType(input, 'email'),
  };
  const supabase = getSupabase();
  const { error } = await supabase.from('team_registrations').insert({
    ...base,
    contact_name: '',
    notes: '',
    form_id: input.formId,
    answers: input.answers,
  });
  if (!error) return;
  if (!isMissingColumn(error)) throw error;

  // compatibilità: senza le colonne nuove le risposte finiscono nelle note
  const { error: legacyError } = await supabase.from('team_registrations').insert({
    ...base,
    contact_name: input.answers[1]?.value ?? '',
    notes: input.answers.map((a) => `${a.label}: ${a.value}`).join('\n'),
  });
  if (legacyError) throw legacyError;
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
