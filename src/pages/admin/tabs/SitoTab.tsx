import { useRef, useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { useSiteConfig, type SiteHome } from '@/data/site-config';
import { useSiteMode } from '@/data/use-site-mode';
import { useTournament } from '@/data/store';
import { isValidTournamentData, normalizeTournament } from '@/data/tournament';
import { modeBadge, type SiteMode } from '@/lib/site-state';
import { cn } from '@/lib/utils';
import { Btn, Card, CardTitle, Field, TextInput, Toggle, useConfirm } from '../ui';

const modes: { id: SiteMode; title: string; text: string; cls: string }[] = [
  {
    id: 'pre',
    title: 'Pre-torneo',
    text: 'Badge "In arrivo", countdown all\'inizio torneo, pulsante iscrizioni.',
    cls: 'border-cyan-400/60 bg-cyan-400/[0.08]',
  },
  {
    id: 'live',
    title: 'In corso',
    text: 'Badge "Live", prossima partita o partita in campo, capolista nelle card.',
    cls: 'border-red-500/60 bg-red-500/[0.08]',
  },
  {
    id: 'post',
    title: 'Concluso',
    text: 'Badge "Concluso", i campioni di ogni torneo, banner con i social.',
    cls: 'border-amber-500/60 bg-amber-500/[0.08]',
  },
];

const homeFields: { key: keyof SiteHome; label: string; placeholder?: string; type?: string }[] = [
  { key: 'badge', label: 'Etichetta', placeholder: 'Festa Patronale' },
  { key: 'title1', label: 'Titolo riga 1', placeholder: 'Torneo' },
  { key: 'title2', label: 'Titolo riga 2 (neon)', placeholder: 'Patronale' },
  { key: 'brush', label: 'Scritta a mano', placeholder: 'Joga Bonito 2026' },
  { key: 'place', label: 'Luogo', placeholder: 'Vuoto = luogo del torneo' },
  { key: 'start', label: 'Inizio torneo (countdown)', type: 'datetime-local' },
];

function BackupCard() {
  const { data, setData, reset } = useTournament();
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as unknown;
        if (!isValidTournamentData(parsed)) {
          setMsg('File non valido: mancano sezioni obbligatorie.');
          return;
        }
        const ok = await confirm({
          title: 'Importare il file?',
          message: `I dati attuali di "${data.info.name}" verranno sostituiti.`,
          action: 'Importa',
        });
        if (!ok) return;
        setData(normalizeTournament(parsed, data.slug));
        setMsg('Dati importati correttamente.');
      } catch {
        setMsg('File non valido: JSON illeggibile.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardTitle>Backup del torneo</CardTitle>
      <p className="mb-4 text-sm text-zinc-500">
        Scarica o ricarica tutti i dati di "{data.info.name}" in un file JSON.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <Btn onClick={exportJson}>
          <Download className="h-4 w-4" /> Scarica JSON
        </Btn>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = '';
          }}
        />
        <Btn onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Carica JSON
        </Btn>
        <Btn
          variant="danger"
          onClick={async () => {
            const ok = await confirm({
              title: 'Svuotare il torneo?',
              message: 'Squadre, partite, moduli e albo di questo torneo verranno cancellati.',
              action: 'Svuota',
            });
            if (ok) reset();
          }}
        >
          <RotateCcw className="h-4 w-4" /> Svuota torneo
        </Btn>
      </div>
      {msg && <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary">{msg}</p>}
    </Card>
  );
}

/** `backup` = false quando non c'è nessun torneo aperto (il backup riguarda un torneo). */
export default function SitoTab({ backup = true }: { backup?: boolean }) {
  const { config, update, saving, saveError } = useSiteConfig();
  const current = useSiteMode();
  const setHome = (p: Partial<SiteHome>) => update((c) => ({ ...c, home: { ...c.home, ...p } }));

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardTitle
          aside={
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              {saveError ? <span className="text-red-400">{saveError}</span> : saving ? 'Salvataggio…' : 'Vale per tutto il sito'}
            </span>
          }
        >
          Modalità del sito
        </CardTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {modes.map((m) => {
            const on = config.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => update((c) => ({ ...c, mode: m.id }))}
                className={cn(
                  'flex flex-col gap-2 rounded-[14px] border p-4 text-left transition-colors',
                  on ? m.cls : 'border-white/[0.08] bg-[#0d0d0d] hover:border-white/20',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'h-4 w-4 rounded-full border-2',
                      on ? 'border-white bg-white shadow-[inset_0_0_0_3px_#0c0c0c]' : 'border-white/30',
                    )}
                  />
                  <span className="font-display text-lg uppercase text-white">{m.title}</span>
                </span>
                <span className="text-sm leading-snug text-zinc-400">{m.text}</span>
              </button>
            );
          })}
        </div>
        {config.mode === null && (
          <p className="mt-3 text-sm text-zinc-500">
            Nessuna modalità scelta: ora il sito mostra "{modeBadge[current].label}", ricavato dagli stati dei tornei.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>Home del sito</CardTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {homeFields.map((f) => (
            <Field key={f.key} label={f.label}>
              <TextInput
                type={f.type ?? 'text'}
                value={config.home[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setHome({ [f.key]: e.target.value })}
              />
            </Field>
          ))}
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          Senza data di inizio, il countdown usa la prima partita in calendario.
        </p>
        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <Toggle
            on={config.intro}
            onChange={(intro) => update((c) => ({ ...c, intro }))}
            label="Intro animata all'apertura del sito"
          />
        </div>
      </Card>

      {backup && <BackupCard />}
    </div>
  );
}
