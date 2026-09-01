import { useState, type ReactNode } from 'react';
import { CheckCircle2, Users } from 'lucide-react';
import { cn, getErrorMessage } from '@/lib/utils';
import { useTournament } from '@/data/store';
import { submitRegistration } from '@/data/registrations-api';
import PageHeader from '@/components/PageHeader';

const inputCls =
  'w-full rounded-sm border border-white/10 bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-primary [color-scheme:dark]';

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

const initialForm = {
  teamName: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  playersCount: '',
  notes: '',
};

function RegistrationForm({ slug }: { slug: string }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamName.trim() || !form.contactName.trim()) {
      setError('Nome squadra e referente sono obbligatori.');
      return;
    }
    if (!form.contactPhone.trim() && !form.contactEmail.trim()) {
      setError('Inserisci almeno un contatto: telefono o email.');
      return;
    }
    setError(null);
    setSubmitting(true);
    submitRegistration(slug, {
      teamName: form.teamName.trim(),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      playersCount: form.playersCount ? Number(form.playersCount) || null : null,
      notes: form.notes.trim(),
    })
      .then(() => setDone(true))
      .catch((err: unknown) => setError(getErrorMessage(err, 'Errore di invio, riprova.')))
      .finally(() => setSubmitting(false));
  };

  if (done) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-md border border-primary/30 bg-primary/[0.06] p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <h3 className="font-display text-xl uppercase tracking-wide text-white">Richiesta inviata!</h3>
        <p className="text-sm text-zinc-400">Il comitato ti ricontatterà a breve per confermare l'iscrizione.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-4 rounded-md border border-white/10 bg-[#101010] p-6">
      <Field label="Nome squadra">
        <input className={inputCls} value={form.teamName} onChange={set('teamName')} required />
      </Field>
      <Field label="Referente">
        <input className={inputCls} value={form.contactName} onChange={set('contactName')} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Telefono">
          <input className={inputCls} value={form.contactPhone} onChange={set('contactPhone')} />
        </Field>
        <Field label="Email">
          <input className={inputCls} type="email" value={form.contactEmail} onChange={set('contactEmail')} />
        </Field>
      </div>
      <Field label="Numero giocatori (opzionale)">
        <input className={inputCls} type="number" min={1} value={form.playersCount} onChange={set('playersCount')} />
      </Field>
      <Field label="Note (opzionale)">
        <textarea rows={3} className={cn(inputCls, 'resize-y')} value={form.notes} onChange={set('notes')} />
      </Field>

      {error && <p className="text-xs font-semibold uppercase tracking-widest text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="font-display w-full rounded-sm bg-primary px-4 py-3 text-sm uppercase tracking-widest text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? 'Invio in corso…' : 'Invia iscrizione'}
      </button>
    </form>
  );
}

export default function Iscrizioni() {
  const { data } = useTournament();
  const open = data.siteState === 'pre-season' && data.preSeason.registrationsOpen;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <PageHeader title="Iscrizioni" brush="entra in gioco" />

      {open ? (
        <>
          <p className="mx-auto mb-8 max-w-lg text-center text-sm leading-relaxed text-zinc-400">
            {data.preSeason.registrationsInfo}
          </p>
          <RegistrationForm slug={data.slug} />
        </>
      ) : (
        <div className="mx-auto max-w-lg rounded-md border border-white/10 bg-[#101010] p-8 text-center">
          <p className="text-sm text-zinc-400">Le iscrizioni non sono al momento aperte. Segui i nostri canali social per sapere quando riapriranno.</p>
        </div>
      )}

      {data.teams.length > 0 && (
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-4 flex items-center justify-center gap-2 font-display text-2xl uppercase tracking-wide text-white">
            <Users className="h-5 w-5 text-primary" /> Squadre confermate
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.teams.map((t) => (
              <li
                key={t.id}
                className="rounded-sm border border-white/10 bg-[#101010] px-4 py-2.5 text-center font-display uppercase tracking-wide text-zinc-200"
              >
                {t.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
