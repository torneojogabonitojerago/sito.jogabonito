import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, Plus, Trash2 } from 'lucide-react';
import { useTournament } from '@/data/store';
import { newForm, newId, type FormField, type FormFieldType, type RegistrationForm } from '@/data/tournament';
import { cn } from '@/lib/utils';
import { Btn, Card, Field, SelectInput, TextArea, TextInput, Toggle, useConfirm } from '../ui';
import type { TeamRegistration } from '@/data/registrations';

const fieldTypes: { id: FormFieldType; label: string }[] = [
  { id: 'text', label: 'Testo' },
  { id: 'tel', label: 'Telefono' },
  { id: 'email', label: 'Email' },
  { id: 'number', label: 'Numero' },
  { id: 'textarea', label: 'Testo lungo' },
  { id: 'select', label: 'Scelta' },
  { id: 'check', label: 'Consenso' },
];

const typeLabel = (t: FormFieldType) => fieldTypes.find((x) => x.id === t)?.label ?? t;

function FieldRow({
  field,
  first,
  last,
  onChange,
  onMove,
  onRemove,
}: {
  field: FormField;
  first: boolean;
  last: boolean;
  onChange: (p: Partial<FormField>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const iconBtn =
    'rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-30';
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-white/[0.08] bg-[#0d0d0d] p-3 sm:flex-row sm:items-start">
      <div className="flex gap-0.5 sm:flex-col">
        <button type="button" className={iconBtn} onClick={() => onMove(-1)} disabled={first} aria-label="Sposta su">
          <ArrowUp className="h-4 w-4" />
        </button>
        <button type="button" className={iconBtn} onClick={() => onMove(1)} disabled={last} aria-label="Sposta giù">
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
      <div className="grid min-w-0 flex-1 gap-2.5 sm:grid-cols-2">
        <TextInput value={field.label} onChange={(e) => onChange({ label: e.target.value })} aria-label="Etichetta" />
        <SelectInput
          value={field.type}
          onChange={(e) => onChange({ type: e.target.value as FormFieldType })}
          aria-label="Tipo di campo"
        >
          {fieldTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </SelectInput>
        {field.type === 'select' ? (
          <TextInput
            value={field.options ?? ''}
            onChange={(e) => onChange({ options: e.target.value })}
            placeholder="Opzioni separate da virgola"
            aria-label="Opzioni"
          />
        ) : field.type !== 'check' ? (
          <TextInput
            value={field.placeholder ?? ''}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            placeholder="Testo di esempio"
            aria-label="Testo di esempio"
          />
        ) : (
          <span className="self-center text-xs text-zinc-500">Casella da spuntare</span>
        )}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onChange({ required: !field.required })}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors',
              field.required ? 'border-primary/50 bg-primary/[0.12] text-primary' : 'border-white/15 text-zinc-500',
            )}
          >
            {field.required ? 'Obbligatorio' : 'Facoltativo'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Elimina campo"
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModuliTab({ registrations }: { registrations: TeamRegistration[] }) {
  const { data, update } = useTournament();
  const confirm = useConfirm();
  const [selId, setSelId] = useState<string | null>(null);
  const form = data.forms.find((f) => f.id === selId) ?? data.forms[0];

  const setForms = (fn: (forms: RegistrationForm[]) => RegistrationForm[]) =>
    update((prev) => ({ ...prev, forms: fn(prev.forms) }));
  const patch = (p: Partial<RegistrationForm>) =>
    form && setForms((forms) => forms.map((f) => (f.id === form.id ? { ...f, ...p } : f)));
  const setFields = (fn: (fields: FormField[]) => FormField[]) => form && patch({ fields: fn(form.fields) });

  const add = () => {
    const f = { ...newForm(false), name: 'Nuovo modulo', button: 'Invia', success: 'Grazie! Ti contatteremo presto.' };
    setForms((forms) => [...forms, f]);
    setSelId(f.id);
  };

  const duplicate = () => {
    if (!form) return;
    const copy: RegistrationForm = {
      ...form,
      id: newId('fm'),
      name: `${form.name} (copia)`,
      open: false,
      fields: form.fields.map((x) => ({ ...x, id: newId('f') })),
    };
    setForms((forms) => [...forms, copy]);
    setSelId(copy.id);
  };

  const remove = async () => {
    if (!form) return;
    const count = registrations.filter((r) => r.formId === form.id).length;
    const ok = await confirm({
      title: `Eliminare "${form.name}"?`,
      message: count
        ? `Le ${count} iscrizioni già ricevute restano, ma non saranno più collegate a un modulo.`
        : 'Il modulo verrà eliminato.',
    });
    if (ok) {
      setForms((forms) => forms.filter((f) => f.id !== form.id));
      setSelId(null);
    }
  };

  const move = (i: number, dir: -1 | 1) =>
    setFields((fields) => {
      const out = [...fields];
      const [x] = out.splice(i, 1);
      out.splice(i + dir, 0, x);
      return out;
    });

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">
        {data.forms.map((f) => {
          const on = f.id === form?.id;
          const count = registrations.filter((r) => r.formId === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelId(f.id)}
              className={cn(
                'flex flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-colors',
                on ? 'border-primary bg-primary/[0.1]' : 'border-white/[0.08] bg-[#101010] hover:border-primary/40',
              )}
            >
              <span className="font-display text-lg uppercase leading-tight text-white">{f.name}</span>
              <span className="flex flex-wrap gap-x-3 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                <span className={f.open ? 'text-green-400' : 'text-zinc-500'}>{f.open ? '● Aperto' : 'Chiuso'}</span>
                <span>{f.fields.length} campi</span>
                <span>{count} iscrizioni</span>
              </span>
            </button>
          );
        })}
        <Btn variant="primary" onClick={add} className="mt-1">
          <Plus className="h-4 w-4" /> Nuovo modulo
        </Btn>
      </div>

      {!form ? (
        <div className="rounded-[14px] border border-dashed border-white/[0.12] p-10 text-center text-zinc-400">
          Nessun modulo. Creane uno per aprire le iscrizioni.
        </div>
      ) : (
        <Card className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Toggle on={form.open} onChange={(open) => patch({ open })} label={form.open ? 'Aperto' : 'Chiuso'} />
            <div className="flex flex-wrap gap-1.5">
              <a
                href={`/${data.slug}/iscrizioni?anteprima=${form.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 font-display text-xs uppercase tracking-[0.1em] text-zinc-200 transition-colors hover:border-primary hover:text-primary"
              >
                <Eye className="h-3.5 w-3.5" /> Anteprima
              </a>
              <Btn small onClick={duplicate}>
                <Copy className="h-3.5 w-3.5" /> Duplica
              </Btn>
              <Btn small variant="danger" onClick={remove}>
                <Trash2 className="h-3.5 w-3.5" /> Elimina
              </Btn>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome del modulo">
              <TextInput value={form.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field label="Testo del pulsante">
              <TextInput value={form.button} onChange={(e) => patch({ button: e.target.value })} placeholder="Invia" />
            </Field>
            <Field label="Testo introduttivo" className="sm:col-span-2">
              <TextArea
                value={form.intro}
                onChange={(e) => patch({ intro: e.target.value })}
                placeholder="Quota, scadenza, requisiti…"
              />
            </Field>
            <Field label="Messaggio dopo l'invio" className="sm:col-span-2">
              <TextInput value={form.success} onChange={(e) => patch({ success: e.target.value })} />
            </Field>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-display text-lg uppercase text-white">Campi</span>
            {form.fields.length === 0 && <p className="text-sm text-zinc-500">Nessun campo: aggiungine uno.</p>}
            {form.fields.map((f, i) => (
              <FieldRow
                key={f.id}
                field={f}
                first={i === 0}
                last={i === form.fields.length - 1}
                onChange={(p) => setFields((fields) => fields.map((x) => (x.id === f.id ? { ...x, ...p } : x)))}
                onMove={(dir) => move(i, dir)}
                onRemove={() => setFields((fields) => fields.filter((x) => x.id !== f.id))}
              />
            ))}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {fieldTypes.map((t) => (
                <Btn
                  key={t.id}
                  small
                  variant="quiet"
                  className="border-white/10"
                  onClick={() =>
                    setFields((fields) => [
                      ...fields,
                      { id: newId('f'), label: typeLabel(t.id), type: t.id, required: false },
                    ])
                  }
                >
                  + {t.label}
                </Btn>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
