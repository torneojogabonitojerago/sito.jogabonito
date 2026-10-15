import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { cn, getErrorMessage } from '@/lib/utils';
import { useTournament } from '@/data/store';
import { groupsOf, type FormField, type RegistrationForm } from '@/data/tournament';
import { submitRegistration } from '@/data/registrations-api';
import { isAdminUnlocked } from '@/pages/admin/AdminGate';
import PageHeader from '@/components/PageHeader';

type Values = Record<string, string>;

const optionsOf = (f: FormField): string[] =>
  (f.options ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

/** Un campo "scelta" senza opzioni si comporta come un campo di testo. */
const kindOf = (f: FormField) => (f.type === 'select' && optionsOf(f).length === 0 ? 'text' : f.type);

function validate(form: RegistrationForm, values: Values): { bad: Set<string>; message: string | null } {
  const bad = new Set<string>();
  let missing = false;
  for (const f of form.fields) {
    const v = (values[f.id] ?? '').trim();
    if (f.required && (f.type === 'check' ? v !== '1' : !v)) {
      bad.add(f.id);
      missing = true;
      continue;
    }
    if (!v) continue;
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) bad.add(f.id);
    if (f.type === 'tel' && v.replace(/\D/g, '').length < 6) bad.add(f.id);
  }
  if (missing) return { bad, message: 'Compila i campi obbligatori evidenziati.' };
  if (bad.size) return { bad, message: 'Controlla email e telefono: il formato non è valido.' };
  return { bad, message: null };
}

function FieldInput({
  field,
  value,
  bad,
  onChange,
}: {
  field: FormField;
  value: string;
  bad: boolean;
  onChange: (v: string) => void;
}) {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  const labelCls = 'text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400';
  const inputCls = cn('input-dark', bad && 'border-red-500 focus:border-red-500');
  const kind = kindOf(field);

  if (kind === 'check') {
    const on = value === '1';
    return (
      <button
        type="button"
        onClick={() => onChange(on ? '' : '1')}
        className="flex items-center gap-3 py-1 text-left text-[15px] text-zinc-300"
      >
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-2 text-[15px] font-bold text-[#0a0a0a]',
            on ? 'border-primary bg-primary' : bad ? 'border-red-500' : 'border-white/25',
          )}
        >
          {on ? '✓' : ''}
        </span>
        {label}
      </button>
    );
  }

  if (kind === 'select') {
    return (
      <div className="flex flex-col gap-2">
        <span className={labelCls}>{label}</span>
        <div className="flex flex-wrap gap-1.5">
          {optionsOf(field).map((o) => {
            const on = value === o;
            return (
              <button
                key={o}
                type="button"
                onClick={() => onChange(on ? '' : o)}
                className={cn(
                  'min-w-14 rounded-xl border px-4 py-3 font-display text-[17px] uppercase tracking-[0.04em] transition-colors',
                  on
                    ? 'border-primary bg-primary/20 text-white'
                    : bad
                      ? 'border-red-500 text-zinc-400'
                      : 'border-white/[0.12] text-zinc-400 hover:border-primary/50 hover:text-white',
                )}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-2">
      <span className={labelCls}>{label}</span>
      {kind === 'textarea' ? (
        <textarea
          rows={3}
          className={cn(inputCls, 'resize-y')}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputCls}
          type={kind}
          inputMode={kind === 'number' ? 'numeric' : undefined}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function DynamicForm({
  slug,
  form,
  preview,
  onSent,
}: {
  slug: string;
  form: RegistrationForm;
  preview: boolean;
  onSent: (title: string) => void;
}) {
  const [values, setValues] = useState<Values>({});
  const [bad, setBad] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validate(form, values);
    setBad(check.bad);
    setError(check.message);
    if (check.message) return;
    if (preview) {
      setError("Anteprima: l'iscrizione non viene inviata.");
      return;
    }

    const answers = form.fields
      .map((f) => ({
        label: f.label,
        type: f.type,
        value: f.type === 'check' ? (values[f.id] === '1' ? 'Sì' : '') : (values[f.id] ?? '').trim(),
      }))
      .filter((a) => a.value);
    const title = answers.find((a) => a.type !== 'check')?.value ?? 'Iscrizione';

    setSubmitting(true);
    submitRegistration(slug, { formId: form.id, title, answers })
      .then(() => {
        setValues({});
        onSent(title);
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Errore di invio, riprova.')))
      .finally(() => setSubmitting(false));
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 px-[clamp(20px,3vw,36px)] py-7">
      {preview && (
        <span className="self-start rounded-full bg-amber-500/[0.12] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
          Anteprima {form.open ? '' : '· modulo chiuso'}
        </span>
      )}
      <span className="font-display text-[28px] uppercase leading-none text-white">{form.name}</span>
      {form.fields.map((f) => (
        <FieldInput
          key={f.id}
          field={f}
          value={values[f.id] ?? ''}
          bad={bad.has(f.id)}
          onChange={(v) => setValues((prev) => ({ ...prev, [f.id]: v }))}
        />
      ))}

      {error && <span className="text-sm font-semibold text-red-400">{error}</span>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-neon py-[18px] text-[19px] tracking-[0.14em] shadow-[0_0_40px_rgba(255,0,255,0.35)] hover:shadow-[0_0_60px_rgba(255,0,255,0.55)] disabled:opacity-60"
      >
        {submitting ? 'Invio in corso…' : form.button || 'Invia'}
      </button>
    </form>
  );
}

export default function Iscrizioni() {
  const { data } = useTournament();
  const [params] = useSearchParams();
  const previewId = isAdminUnlocked() ? params.get('anteprima') : null;
  const previewForm = previewId ? data.forms.find((f) => f.id === previewId) : undefined;

  const openForms = data.forms.filter((f) => f.open);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [sentTitle, setSentTitle] = useState<string | null>(null);

  const form = previewForm ?? openForms.find((f) => f.id === pickedId) ?? openForms[0];
  const groups = groupsOf(data).length;

  const info = [
    { label: 'Date', value: data.info.dates },
    { label: 'Luogo', value: data.info.location },
    { label: 'Formula', value: `${groups === 1 ? 'Girone unico' : `${groups} gironi`} + finali` },
  ].filter((x) => x.value);

  return (
    <div>
      <PageHeader title="Iscrizioni" brush="porta la tua squadra in campo" aside={data.info.name} />

      <section className="mx-auto flex max-w-[1180px] flex-wrap items-start gap-8 px-4 pb-24 sm:px-6">
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-[18px]">
          {!previewForm && openForms.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="label-xs">Scegli il modulo</span>
              {openForms.map((f) => {
                const on = f.id === form?.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setPickedId(f.id);
                      setSentTitle(null);
                    }}
                    className={cn(
                      'flex items-center justify-between gap-2.5 rounded-xl border px-4 py-3.5 text-left font-display text-[17px] uppercase tracking-[0.04em] text-white transition-colors',
                      on ? 'border-primary bg-primary/[0.12]' : 'border-white/10 bg-[#101010] hover:border-primary/50',
                    )}
                  >
                    {f.name}
                    <span className={on ? 'text-primary' : 'text-zinc-600'}>→</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex flex-col gap-3.5 rounded-2xl border border-white/[0.08] bg-[#101010] p-[22px]">
            <span className="font-display text-2xl uppercase leading-[1.05] text-white">{data.info.name}</span>
            {info.map((x) => (
              <div key={x.label} className="flex flex-col gap-0.5 border-t border-white/[0.06] pt-3">
                <span className="label-xs">{x.label}</span>
                <span className="text-base font-semibold text-zinc-200">{x.value}</span>
              </div>
            ))}
          </div>
          {form?.intro && (
            <p className="whitespace-pre-line rounded-[14px] border border-primary/25 bg-primary/5 px-5 py-[18px] text-[15px] leading-normal text-zinc-300 [text-wrap:pretty]">
              {form.intro}
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
          {!form ? (
            <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
              <span className="font-display text-[clamp(34px,4vw,48px)] uppercase leading-none text-white">
                Iscrizioni chiuse
              </span>
              <span className="font-brush text-[28px] text-cyan-400">segui i social per la prossima apertura</span>
              <Link to="../risultati" relative="path" className="btn-ghost mt-3 px-[22px] py-[13px] text-[15px]">
                Vai ai risultati
              </Link>
            </div>
          ) : sentTitle ? (
            <div className="flex flex-col items-center gap-3.5 px-8 py-14 text-center">
              <img src="/logo.png" alt="" className="h-[110px] w-[110px] object-contain" />
              <span className="font-display text-glow text-[clamp(36px,4vw,52px)] uppercase leading-none text-white">
                Iscrizione inviata!
              </span>
              <span className="font-brush text-[30px] text-cyan-400">{sentTitle} è in lista</span>
              {form.success && (
                <span className="max-w-[44ch] text-base leading-normal text-zinc-400">{form.success}</span>
              )}
              <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSentTitle(null)}
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
            <DynamicForm
              key={form.id}
              slug={data.slug}
              form={form}
              preview={Boolean(previewForm)}
              onSent={setSentTitle}
            />
          )}
        </div>
      </section>
    </div>
  );
}
