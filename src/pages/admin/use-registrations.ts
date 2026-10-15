import { useCallback, useEffect, useState } from 'react';
import {
  deleteRegistration,
  listRegistrations,
  subscribeRegistrations,
  updateRegistrationStatus,
} from '@/data/registrations-api';
import type { RegistrationStatus, TeamRegistration } from '@/data/registrations';
import { getErrorMessage } from '@/lib/utils';

/** Iscrizioni del torneo in gestione, aggiornate in tempo reale. */
export function useRegistrations(slug: string) {
  const [list, setList] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    listRegistrations(slug)
      .then((rows) => {
        setList(rows);
        setError(null);
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Errore di caricamento iscrizioni')))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    load();
    return subscribeRegistrations(slug, load);
  }, [slug, load]);

  const setStatus = useCallback(
    (id: string, status: RegistrationStatus) => {
      setList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      updateRegistrationStatus(slug, id, status).catch((err: unknown) => {
        setError(getErrorMessage(err, 'Errore di aggiornamento'));
        load();
      });
    },
    [slug, load],
  );

  const remove = useCallback(
    (id: string) => {
      setList((prev) => prev.filter((r) => r.id !== id));
      deleteRegistration(slug, id).catch((err: unknown) => {
        setError(getErrorMessage(err, 'Errore di eliminazione'));
        load();
      });
    },
    [slug, load],
  );

  return { list, loading, error, setStatus, remove };
}
