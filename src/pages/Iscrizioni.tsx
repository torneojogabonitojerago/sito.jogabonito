import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn, getErrorMessage } from '@/lib/utils';
import { useTournament } from '@/data/store';
import { registrationsOpen } from '@/data/tournament';
import { submitRegistration } from '@/data/registrations-api';
import PageHeader from '@/components/PageHeader';

const initialForm = {
  teamName: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  playersCount: '',
  notes: '',
};

type FormKey = keyof typeof initialForm;

function validate(form: typeof initialForm): { bad: Set<FormKey>; message: string | null } {
  const bad = new Set<FormKey>();
  if (!form.teamName.trim()) bad.add('teamName');
  if (!form.contactName.trim()) bad.add('contactName');
  const phone = form.contactPhone.trim();
  const email = form.contactEmail.trim();
  if (phone && phone.replace(/\D/g, '').length < 6) bad.add('contactPhone');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.add('contactEmail');

  if (bad.has('teamName') || bad.has('contactName')) return { bad, message: 'Compila i campi obbligatori.' };
  if (!phone && !email) {
    bad.add('contactPhone');
    bad.add('contactEmail');
    return { bad, message: 'Inserisci almeno un contatto: telefono o email.' };
  }
  if (bad.size) return { bad, message: 'Controlla i campi evidenziati.' };
  return { bad, message: null };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function RegistrationForm({ slug, onSent }: { slug: string; onSent: (team: string) => void }) {
  const [form, setForm] = useState(initialForm);
  const [bad, setBad] = useState<Set<FormKey>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: FormKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const inputCls = (k: FormKey) => cn('input-dark', bad.has(k) && 'border-red-500 focus:border-red-500');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validate(form);
    setBad(check.bad);
    setError(check.message);
    if (check.message) return;

    setSubmitting(true);
    submitRegistration(slug, {
      teamName: form.teamName.trim(),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      playersCount: form.playersCount ? Number(form.playersCount) || null : null,
      notes: form.notes.trim(),
    })
      .then(() => {
        onSent(form.teamName.trim());
        setForm(initialForm);
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Errore di invio, riprova.')))
      .finally(() => setSubmitting(false));
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 px-[clamp(20px,3vw,36px)] py-7">
      <span className="font-display text-[28px] uppercase leading-none text-white">Iscrizione squadra</span>
      <Field label="Nome squadra *">
        <input className={inputCls('teamName')} value={form.teamName} onChange={set('teamName')} placeholder="Es. Real Campanile" />
      </Field>
      <Field label="Referente *">
        <input className={inputCls('contactName')} value={form.contactName} onChange={set('contactName')} placeholder="Nome e cognome" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Telefono">
          <input
            className={inputCls('contactPhone')}
            type="tel"
            value={form.contactPhone}
            onChange={set('contactPhone')}
            placeholder="333 123 4567"
          />
        </Field>
        <Field label="Email">
          <input
            className={inputCls('contactEmail')}
            type="email"
            value={form.contactEmail}
            onChange={set('contactEmail')}
            placeholder="nome@email.it"
          />
        </Field>
      </div>
      <Field label="Numero giocatori">
        <input
          className={inputCls('playersCount')}
          type="number"
          min={1}
          value={form.playersCount}
          onChange={set('playersCount')}
        />
      </Field>
      <Field label="Note">
        <textarea
          rows={3}
          className={cn(inputCls('notes'), 'resize-y font-[inherit]')}
          value={form.notes}
          onChange={set('notes')}
        />
      </Field>

      {error && <span className="text-sm font-semibold text-red-400">{error}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-neon py-[18px] text-[19px] tracking-[0.14em] shadow-[0_0_40px_rgba(255,0,255,0.35)] hover:shadow-[0_0_60px_rgba(255,0,255,0.55)] disabled:opacity-60"
      >
        {submitting ? 'Invio in corso…' : 'Invia iscrizione'}
      </button>
    </form>
  );
}

export default function Iscrizioni() {
  const { data } = useTournament();
  const open = registrationsOpen(data);
  const [sentTeam, setSentTeam] = useState<string | null>(null);

  const info = [
    { label: 'Date', value: data.info.dates },
    { label: 'Luogo', value: data.info.location },
    { label: 'Formula', value: 'Girone unico + finali' },
  ].filter((x) => x.value);

  return (
    <div>
      <PageHeader title="Iscrizioni" brush="porta la tua squadra in campo" aside={data.info.name} />

      <section className="mx-auto flex max-w-[1180px] flex-wrap items-start gap-8 px-4 pb-24 sm:px-6">
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-[18px]">
          <div className="flex flex-col gap-3.5 rounded-2xl border border-white/[0.08] bg-[#101010] p-[22px]">
            <span className="font-display text-2xl uppercase leading-[1.05] text-white">{data.info.name}</span>
            {info.map((x) => (
              <div key={x.label} className="flex flex-col gap-0.5 border-t border-white/[0.06] pt-3">
                <span className="label-xs">{x.label}</span>
                <span className="text-base font-semibold text-zinc-200">{x.value}</span>
              </div>
            ))}
          </div>
          {open && data.preSeason.registrationsInfo && (
            <p className="whitespace-pre-line rounded-[14px] border border-primary/25 bg-primary/5 px-5 py-[18px] text-[15px] leading-normal text-zinc-300 [text-wrap:pretty]">
              {data.preSeason.registrationsInfo}
            </p>
          )}
          <Link
            to="../regolamento"
            relative="path"
            className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary"
          >
            Leggi il regolamento →
          </Link>
        </div>

        <div className="min-w-0 flex-[2_1_460px] overflow-hidden rounded-[20px] border border-primary/40 bg-[linear-gradient(160deg,rgba(0,0,0,0.9),rgba(25,0,25,0.85))] shadow-[0_0_80px_rgba(255,0,255,0.15)]">
          {!open ? (
            <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
              <span className="font-display text-[clamp(34px,4vw,48px)] uppercase leading-none text-white">
                Iscrizioni chiuse
              </span>
              <span className="font-brush text-[28px] text-cyan-400">segui i social per la prossima apertura</span>
              <Link to="../risultati" relative="path" className="btn-ghost mt-3 px-[22px] py-[13px] text-[15px]">
                Vai ai risultati
              </Link>
            </div>
          ) : sentTeam ? (
            <div className="flex flex-col items-center gap-3.5 px-8 py-14 text-center">
              <img src="/logo.png" alt="" className="h-[110px] w-[110px] object-contain mix-blend-screen" />
              <span className="font-display text-glow text-[clamp(36px,4vw,52px)] uppercase leading-none text-white">
                Iscrizione inviata!
              </span>
              <span className="font-brush text-[30px] text-cyan-400">{sentTeam} è in lista</span>
              <span className="max-w-[44ch] text-base leading-normal text-zinc-400">
                Il comitato ti ricontatterà a breve per confermare l'iscrizione.
              </span>
              <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSentTeam(null)}
                  className="btn-ghost px-[22px] py-[13px] text-[15px]"
                >
                  Nuova iscrizione
                </button>
                <Link to="/" className="btn-neon px-[22px] py-[13px] text-[15px] shadow-none">
                  Torna alla home
                </Link>
              </div>
            </div>
          ) : (
            <RegistrationForm slug={data.slug} onSent={setSentTeam} />
          )}
        </div>
      </section>
    </div>
  );
}
