import { useState } from 'react';
import { Check, UserPlus, X } from 'lucide-react';
import { useTournament } from '@/data/store';
import { newId } from '@/data/tournament';
import type { RegistrationStatus, TeamRegistration } from '@/data/registrations';
import { cn } from '@/lib/utils';
import { Btn, SelectInput, useConfirm } from '../ui';
import type { useRegistrations } from '../use-registrations';

const statusStyle: Record<RegistrationStatus, { label: string; cls: string; border: string }> = {
  pending: { label: 'In attesa', cls: 'bg-amber-500/15 text-amber-400', border: 'border-amber-500/[0.35]' },
  approved: { label: 'Approvata', cls: 'bg-green-500/[0.12] text-green-400', border: 'border-white/[0.08]' },
  rejected: { label: 'Rifiutata', cls: 'bg-red-500/[0.12] text-red-400', border: 'border-white/[0.06]' },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function IscrizioniTab({ regs }: { regs: ReturnType<typeof useRegistrations> }) {
  const { data, update } = useTournament();
  const confirm = useConfirm();
  const [formFilter, setFormFilter] = useState('all');

  const formName = (r: TeamRegistration) =>
    data.forms.find((f) => f.id === r.formId)?.name ?? (r.formId ? 'Modulo eliminato' : 'Vecchio modulo');

  const list = regs.list.filter((r) => formFilter === 'all' || (r.formId ?? 'legacy') === formFilter);
  const alreadyTeam = (r: TeamRegistration) =>
    data.teams.some((t) => t.name.trim().toLowerCase() === r.title.trim().toLowerCase());

  const remove = async (r: TeamRegistration) => {
    if (await confirm({ title: 'Eliminare l’iscrizione?', message: `${r.title} verrà cancellata definitivamente.` })) {
      regs.remove(r.id);
    }
  };

  /* approvare un’iscrizione propone di aggiungere la squadra al torneo */
  const approve = async (r: TeamRegistration) => {
    regs.setStatus(r.id, 'approved');
    if (alreadyTeam(r)) return;
    const add = await confirm({
      title: 'Aggiungere la squadra?',
      message: `Vuoi aggiungere "${r.title}" alle squadre del torneo?`,
      action: 'Aggiungi',
    });
    if (add) {
      update((prev) => ({ ...prev, teams: [...prev.teams, { id: newId('t'), name: r.title, group: 'A' }] }));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-xl uppercase text-white">
          {list.length} {list.length === 1 ? 'iscrizione' : 'iscrizioni'}
        </span>
        <SelectInput
          value={formFilter}
          onChange={(e) => setFormFilter(e.target.value)}
          aria-label="Filtra per modulo"
          className="w-auto min-w-[220px]"
        >
          <option value="all">Tutti i moduli</option>
          {data.forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
          {regs.list.some((r) => !r.formId) && <option value="legacy">Vecchio modulo</option>}
        </SelectInput>
      </div>

      {regs.error && <p className="text-sm font-semibold text-red-400">{regs.error}</p>}
      {regs.loading && <p className="text-sm text-zinc-500">Caricamento…</p>}
      {!regs.loading && list.length === 0 && (
        <div className="rounded-[14px] border border-dashed border-white/[0.12] p-10 text-center text-zinc-400">
          Nessuna iscrizione ricevuta.
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((r) => {
          const st = statusStyle[r.status];
          return (
            <div key={r.id} className={cn('flex flex-col gap-3 rounded-[14px] border bg-[#101010] p-4', st.border)}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-display text-xl uppercase text-white">{r.title}</span>
                  <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
                    <span className="rounded-md bg-primary/[0.12] px-2 py-0.5 font-bold uppercase tracking-[0.1em] text-primary">
                      {formName(r)}
                    </span>
                    {fmtDate(r.createdAt)}
                  </span>
                </div>
                <span
                  className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]', st.cls)}
                >
                  {st.label}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {r.answers.slice(1, 5).map((a, i) => (
                  <div key={i} className="min-w-0">
                    <dt className="label-xs truncate">{a.label}</dt>
                    <dd className="truncate text-sm font-semibold text-zinc-200">{a.value}</dd>
                  </div>
                ))}
              </dl>
              {r.answers.length > 5 && (
                <details className="text-sm text-zinc-400">
                  <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Tutte le risposte
                  </summary>
                  <dl className="mt-2 grid gap-1.5">
                    {r.answers.slice(5).map((a, i) => (
                      <div key={i}>
                        <dt className="label-xs">{a.label}</dt>
                        <dd className="whitespace-pre-line text-zinc-200">{a.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
              <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                <Btn small onClick={() => approve(r)} disabled={r.status === 'approved'}>
                  <Check className="h-3.5 w-3.5" /> Approva
                </Btn>
                <Btn small onClick={() => regs.setStatus(r.id, 'rejected')} disabled={r.status === 'rejected'}>
                  Rifiuta
                </Btn>
                {r.status === 'approved' && !alreadyTeam(r) && (
                  <Btn
                    small
                    variant="quiet"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        teams: [...prev.teams, { id: newId('t'), name: r.title, group: 'A' }],
                      }))
                    }
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Aggiungi squadra
                  </Btn>
                )}
                <Btn small variant="danger" onClick={() => remove(r)} className="ml-auto" aria-label="Elimina iscrizione">
                  <X className="h-3.5 w-3.5" />
                </Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
