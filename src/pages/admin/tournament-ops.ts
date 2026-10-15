import {
  blankTournamentData,
  isDefined,
  newForm,
  newId,
  podiumOf,
  tournamentYear,
  type TournamentData,
} from '@/data/tournament';

/* ============================================================
   Operazioni sull'intero torneo: archiviazione, nuova edizione, creazione
   ============================================================ */

/**
 * "Chiudi e archivia": aggiunge all'albo l'edizione dell'anno (se manca) con il podio,
 * chiude tutti i moduli e segna il torneo come archiviato.
 */
export function archiveTournament(d: TournamentData): TournamentData {
  const year = tournamentYear(d);
  const [winner, runnerUp, third] = podiumOf(d).map((x) => (x === '—' ? 'Da definire' : x));
  const existing = d.hallOfFame.find((e) => e.year === year);
  const hallOfFame =
    existing && isDefined(existing.winner)
      ? d.hallOfFame
      : [
          { year, winner, runnerUp, thirdPlace: third },
          ...d.hallOfFame.filter((e) => e.year !== year),
        ];

  return {
    ...d,
    hallOfFame,
    forms: d.forms.map((f) => ({ ...f, open: false })),
    archived: true,
    archivedAt: new Date().toISOString(),
  };
}

export function restoreTournament(d: TournamentData): TournamentData {
  return { ...d, archived: false, archivedAt: undefined };
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

/** "I Edizione" → "II Edizione" */
export function nextEdition(edition: string): string {
  const m = edition.match(/^([IVX]+)(\b.*)$/);
  if (!m) return edition;
  const i = ROMAN.indexOf(m[1]);
  return i >= 0 && i < ROMAN.length - 1 ? ROMAN[i + 1] + m[2] : edition;
}

/** Ogni anno a 4 cifre +1: "Calcio Tennis 2026" → "Calcio Tennis 2027" */
export const bumpYears = (s: string): string => s.replace(/\d{4}/g, (y) => String(Number(y) + 1));

/**
 * "Nuova edizione": copia info, squadre, gironi, albo e moduli (con id nuovi e moduli aperti).
 * Non copia partite né iscrizioni. Il nuovo torneo è attivo.
 */
export function newEditionOf(src: TournamentData, slug: string): TournamentData {
  return {
    ...src,
    slug,
    info: {
      ...src.info,
      name: bumpYears(src.info.name),
      brushSubtitle: bumpYears(src.info.brushSubtitle),
      dates: bumpYears(src.info.dates),
      edition: nextEdition(src.info.edition),
    },
    teams: src.teams.map((t) => ({ ...t })),
    matches: [],
    hallOfFame: src.hallOfFame.map((e) => ({ ...e })),
    forms: src.forms.map((f) => ({
      ...f,
      id: newId('fm'),
      open: true,
      fields: f.fields.map((x) => ({ ...x, id: newId('f') })),
    })),
    archived: false,
    archivedAt: undefined,
  };
}

export interface NewTournamentInput {
  name: string;
  edition: string;
  brush: string;
  dates: string;
  place: string;
  copyTeamsFrom?: TournamentData;
  withForm: boolean;
}

export function createTournamentData(slug: string, input: NewTournamentInput): TournamentData {
  const base = blankTournamentData(slug, input.copyTeamsFrom?.sport ?? '', input.name);
  return {
    ...base,
    info: {
      ...base.info,
      name: input.name,
      edition: input.edition || base.info.edition,
      brushSubtitle: input.brush,
      dates: input.dates || base.info.dates,
      location: input.place || base.info.location,
    },
    teams: input.copyTeamsFrom ? input.copyTeamsFrom.teams.map((t) => ({ ...t })) : [],
    groupCount: input.copyTeamsFrom?.groupCount ?? 1,
    rules: input.copyTeamsFrom ? input.copyTeamsFrom.rules.map((r) => ({ ...r })) : base.rules,
    forms: input.withForm ? [newForm(true)] : [],
  };
}

/* ---------- slug ---------- */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Slug libero: "torneo", "torneo-2", "torneo-3"… */
export function uniqueSlug(base: string, taken: string[]): string {
  const root = slugify(base) || 'torneo';
  if (!taken.includes(root)) return root;
  let i = 2;
  while (taken.includes(`${root}-${i}`)) i += 1;
  return `${root}-${i}`;
}
