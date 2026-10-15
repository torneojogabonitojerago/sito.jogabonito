import type { LucideIcon } from 'lucide-react';
import { Rocket, RadioTower, Trophy } from 'lucide-react';
import type { SiteState, TournamentData } from '@/data/tournament';

export interface SiteStateBadge {
  label: string;
  icon: LucideIcon;
  className: string;
  pulse?: boolean;
}

/* Badge per singolo torneo — usato nell'area organizzatori */
export const siteStateBadge: Record<SiteState, SiteStateBadge> = {
  'pre-season': { label: 'Pre-season', icon: Rocket, className: 'border-sky-500/40 bg-sky-500/10 text-sky-400' },
  'live-season': { label: 'Live', icon: RadioTower, className: 'border-red-500/40 bg-red-500/10 text-red-400', pulse: true },
  'off-season': { label: 'Off-season', icon: Trophy, className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
};

/* ============================================================
   MODALITÀ DEL SITO — pre-torneo, in corso, concluso
   ============================================================ */

export type SiteMode = 'pre' | 'live' | 'post';

export const modeOf: Record<SiteState, SiteMode> = {
  'pre-season': 'pre',
  'live-season': 'live',
  'off-season': 'post',
};

/** Modalità globale: basta un torneo in corso per essere "Live", poi conta il pre-torneo. */
export function globalMode(list: TournamentData[]): SiteMode {
  if (list.some((t) => t.siteState === 'live-season')) return 'live';
  if (list.some((t) => t.siteState === 'pre-season')) return 'pre';
  return 'post';
}

export interface ModeBadge {
  label: string;
  className: string;
  dotClassName: string;
  ping: boolean;
}

export const modeBadge: Record<SiteMode, ModeBadge> = {
  live: {
    label: 'Live',
    className: 'border-red-500/[0.45] bg-red-500/10 text-red-400',
    dotClassName: 'bg-red-400',
    ping: true,
  },
  pre: {
    label: 'In arrivo',
    className: 'border-cyan-400/40 bg-cyan-400/[0.08] text-cyan-400',
    dotClassName: 'bg-cyan-400',
    ping: false,
  },
  post: {
    label: 'Concluso',
    className: 'border-amber-500/40 bg-amber-500/[0.08] text-amber-400',
    dotClassName: 'bg-amber-400',
    ping: false,
  },
};

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/tornei_jogabonito_jerago?igsh=Znh5d2R3dTZ1YWlv',
  tiktok: 'https://www.tiktok.com/@torneo.joga.bonit?_r=1&_t=ZN-986yMJ512m6',
};
