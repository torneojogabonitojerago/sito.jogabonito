import type { LucideIcon } from 'lucide-react';
import { Rocket, RadioTower, Trophy } from 'lucide-react';
import type { SiteState } from '@/data/tournament';

export interface SiteStateBadge {
  label: string;
  icon: LucideIcon;
  className: string;
  pulse?: boolean;
}

export const siteStateBadge: Record<SiteState, SiteStateBadge> = {
  'pre-season': { label: 'Pre-season', icon: Rocket, className: 'border-sky-500/40 bg-sky-500/10 text-sky-400' },
  'live-season': { label: 'Live', icon: RadioTower, className: 'border-red-500/40 bg-red-500/10 text-red-400', pulse: true },
  'off-season': { label: 'Off-season', icon: Trophy, className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
};
