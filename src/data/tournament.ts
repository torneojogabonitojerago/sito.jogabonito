/* ============================================================
   DATI DEL TORNEO — dati INIZIALI (fallback).
   Con Supabase configurato, le modifiche admin vengono
   salvate nel cloud e condivise con tutti i visitatori.
   Senza Supabase, restano nel localStorage del browser.
   ============================================================ */

export interface TournamentInfo {
  name: string;
  brushSubtitle: string;
  edition: string;
  location: string;
  dates: string;
  organizer: string;
}

export interface Team {
  id: string;
  name: string;
  group: 'A';
}

export interface SetScore {
  home: number;
  away: number;
}

export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type MatchPhase = 'gironi' | 'semifinale' | 'finalina' | 'finale';

export interface Match {
  id: string;
  date: string; // AAAA-MM-GG
  time: string; // HH:MM
  phase: MatchPhase;
  group?: 'A';
  home: string; // id squadra (vuoto se non definita)
  away: string;
  homeLabel?: string; // es. "1ª Girone A"
  awayLabel?: string;
  sets: SetScore[];
  status: MatchStatus;
}

export interface ScheduleRow {
  time: string;
  label: string;
}

export interface OpeningNight {
  badge: string;
  title: string;
  schedule: ScheduleRow[];
  note: { title: string; text: string };
}

export interface RuleItem {
  title: string;
  text: string;
}

/** Tutto ciò che la pagina admin può modificare */
export interface TournamentData {
  info: TournamentInfo;
  teams: Team[];
  matches: Match[];
  openingNight: OpeningNight;
  rules: RuleItem[];
}

/* ---------- DATI INIZIALI ---------- */

export const defaultData: TournamentData = {
  info: {
    name: 'TORNEO PATRONALE',
    brushSubtitle: 'Calcio Tennis 2026',
    edition: 'I Edizione',
    location: 'Campo della Festa Patronale',
    dates: '24 Luglio — 2 Agosto 2026',
    organizer: 'Comitato Festa Patronale',
  },

  teams: [
    // Girone unico
    { id: 'fcp', name: 'FC Patronale', group: 'A' },
    { id: 'ats', name: 'Atletico Sagra', group: 'A' },
    { id: 'rca', name: 'Real Campanile', group: 'A' },
    { id: 'dif', name: 'Dinamo Festa', group: 'A' },
    { id: 'asl', name: 'AS Luminarie', group: 'A' },
    { id: 'unp', name: 'United Processione', group: 'A' },
    { id: 'spb', name: 'Sporting Banchetto', group: 'A' },
    { id: 'fcg', name: 'FC Girandola', group: 'A' },
  ],

  matches: [
    /* ------- GIRONI — Giornata 1 (24/07) ------- */
    { id: 'g1', date: '2026-07-24', time: '20:30', phase: 'gironi', group: 'A', home: 'fcp', away: 'ats', sets: [{ home: 11, away: 6 }, { home: 11, away: 8 }], status: 'finished' },
    { id: 'g2', date: '2026-07-24', time: '21:00', phase: 'gironi', group: 'A', home: 'asl', away: 'unp', sets: [{ home: 9, away: 11 }, { home: 11, away: 7 }, { home: 8, away: 11 }], status: 'finished' },
    { id: 'g3', date: '2026-07-24', time: '21:30', phase: 'gironi', group: 'A', home: 'rca', away: 'dif', sets: [{ home: 11, away: 9 }, { home: 11, away: 9 }], status: 'finished' },
    { id: 'g4', date: '2026-07-24', time: '22:00', phase: 'gironi', group: 'A', home: 'spb', away: 'fcg', sets: [{ home: 11, away: 5 }, { home: 10, away: 12 }, { home: 11, away: 9 }], status: 'finished' },

    /* ------- GIRONI — Giornata 2 (27/07) ------- */
    { id: 'g5', date: '2026-07-27', time: '20:30', phase: 'gironi', group: 'A', home: 'fcp', away: 'rca', sets: [{ home: 11, away: 8 }, { home: 7, away: 11 }, { home: 12, away: 10 }], status: 'finished' },
    { id: 'g6', date: '2026-07-27', time: '21:00', phase: 'gironi', group: 'A', home: 'asl', away: 'spb', sets: [{ home: 11, away: 9 }, { home: 11, away: 6 }], status: 'finished' },
    { id: 'g7', date: '2026-07-27', time: '21:30', phase: 'gironi', group: 'A', home: 'ats', away: 'dif', sets: [{ home: 6, away: 11 }, { home: 11, away: 9 }, { home: 9, away: 11 }], status: 'finished' },
    { id: 'g8', date: '2026-07-27', time: '22:00', phase: 'gironi', group: 'A', home: 'unp', away: 'fcg', sets: [{ home: 11, away: 7 }, { home: 11, away: 4 }], status: 'finished' },

    /* ------- GIRONI — Giornata 3 (30/07) ------- */
    { id: 'g9', date: '2026-07-30', time: '20:30', phase: 'gironi', group: 'A', home: 'fcp', away: 'dif', sets: [], status: 'scheduled' },
    { id: 'g10', date: '2026-07-30', time: '21:00', phase: 'gironi', group: 'A', home: 'asl', away: 'fcg', sets: [], status: 'scheduled' },
    { id: 'g11', date: '2026-07-30', time: '21:30', phase: 'gironi', group: 'A', home: 'ats', away: 'rca', sets: [], status: 'scheduled' },
    { id: 'g12', date: '2026-07-30', time: '22:00', phase: 'gironi', group: 'A', home: 'unp', away: 'spb', sets: [], status: 'scheduled' },

    /* ------- FASI FINALI ------- */
    { id: 's1', date: '2026-08-01', time: '21:00', phase: 'semifinale', home: '', away: '', homeLabel: '1ª Classificata', awayLabel: '4ª Classificata', sets: [], status: 'scheduled' },
    { id: 's2', date: '2026-08-01', time: '21:45', phase: 'semifinale', home: '', away: '', homeLabel: '2ª Classificata', awayLabel: '3ª Classificata', sets: [], status: 'scheduled' },
    { id: 'f0', date: '2026-08-02', time: '21:00', phase: 'finalina', home: '', away: '', homeLabel: 'Perdente SF1', awayLabel: 'Perdente SF2', sets: [], status: 'scheduled' },
    { id: 'f1', date: '2026-08-02', time: '22:00', phase: 'finale', home: '', away: '', homeLabel: 'Vincente SF1', awayLabel: 'Vincente SF2', sets: [], status: 'scheduled' },
  ],

  openingNight: {
    badge: 'Gran Opening',
    title: 'SERATA DI APERTURA — 24/07',
    schedule: [
      { time: '20:00', label: 'Apertura campi & iscrizioni' },
      { time: '20:30', label: 'Fischio di inizio — Girone unico' },
      { time: '21:00', label: 'Prime partite — Girone unico' },
      { time: '22:30', label: 'Chiusura serata & punto classifica' },
    ],
    note: {
      title: 'SERATA INAUGURALE',
      text: 'Presentazione delle squadre e benedizione del campo. Musica e stand gastronomico per tutta la festa!',
    },
  },

  rules: [
    { title: 'La squadra', text: 'Si gioca 2 contro 2. Sono ammesse fino a 4 persone in rosa con cambi liberi tra un set e l’altro.' },
    { title: 'Il punteggio', text: 'Ogni set si gioca ai 11 punti con vantaggio di 2 (es. 12-10). La partita è al meglio dei 3 set.' },
    { title: 'I tocchi', text: 'Massimo 3 tocchi per passaggio, vietato toccare il pallone con mani e braccia. Vale il rimbalzo a terra (max 1).' },
    { title: 'Il servizio', text: 'Il servizio si esegue da fondo campo, di piede, facendo rimbalzare il pallone una volta prima del colpo.' },
    { title: 'Fase a gironi', text: 'Vittoria 3 punti, sconfitta 0. A parità di punti contano differenza set, differenza punti e scontro diretto.' },
    { title: 'Fasi finali', text: 'Le prime quattro classificate accedono alle semifinali (1ª vs 4ª, 2ª vs 3ª). Seguono finalina 3°/4° posto e finale.' },
  ],
};

export function isValidTournamentData(value: unknown): value is TournamentData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<TournamentData>;
  return (
    Boolean(v.info) &&
    Array.isArray(v.teams) &&
    Array.isArray(v.matches) &&
    Array.isArray(v.rules) &&
    Boolean(v.openingNight)
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

export const teamById = (teams: Team[], id: string): Team | undefined =>
  teams.find((t) => t.id === id);

export const teamName = (teams: Team[], m: Match, side: 'home' | 'away'): string => {
  const id = side === 'home' ? m.home : m.away;
  const label = side === 'home' ? m.homeLabel : m.awayLabel;
  return teamById(teams, id)?.name ?? label ?? 'Da definire';
};

/** set vinti da casa / trasferta */
export const setsWon = (m: Match): { home: number; away: number } => {
  let home = 0;
  let away = 0;
  for (const s of m.sets) {
    if (s.home > s.away) home += 1;
    else if (s.away > s.home) away += 1;
  }
  return { home, away };
};

export interface StandingRow {
  team: Team;
  points: number;
  played: number;
  won: number;
  lost: number;
  setsFor: number;
  setsAgainst: number;
  setDiff: number;
  pointsFor: number;
  pointsAgainst: number;
}

export function computeStandings(teams: Team[], matches: Match[], group?: 'A'): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  teams
    .filter((t) => !group || t.group === group)
    .forEach((t) =>
      rows.set(t.id, {
        team: t,
        points: 0,
        played: 0,
        won: 0,
        lost: 0,
        setsFor: 0,
        setsAgainst: 0,
        setDiff: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      }),
    );

  for (const m of matches) {
    if (m.status !== 'finished' || !m.home || !m.away) continue;
    const rh = rows.get(m.home);
    const ra = rows.get(m.away);
    if (!rh || !ra) continue;
    const sw = setsWon(m);
    rh.played += 1;
    ra.played += 1;
    rh.setsFor += sw.home;
    rh.setsAgainst += sw.away;
    ra.setsFor += sw.away;
    ra.setsAgainst += sw.home;
    for (const s of m.sets) {
      rh.pointsFor += s.home;
      rh.pointsAgainst += s.away;
      ra.pointsFor += s.away;
      ra.pointsAgainst += s.home;
    }
    if (sw.home > sw.away) {
      rh.won += 1;
      rh.points += 3;
      ra.lost += 1;
    } else if (sw.away > sw.home) {
      ra.won += 1;
      ra.points += 3;
      rh.lost += 1;
    }
  }

  return [...rows.values()]
    .map((r) => ({ ...r, setDiff: r.setsFor - r.setsAgainst }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.setDiff - a.setDiff ||
        b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst) ||
        b.pointsFor - a.pointsFor,
    );
}

export const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: '2-digit' });
};

export const phaseLabel: Record<MatchPhase, string> = {
  gironi: 'Fase a gironi',
  semifinale: 'Semifinali',
  finalina: 'Finale 3°/4° posto',
  finale: 'FINALE',
};
