import { useSiteConfig } from '@/data/site-config';
import { useTournamentsRegistry } from '@/data/tournaments-registry';
import { globalMode, type SiteMode } from '@/lib/site-state';

/** Modalità del sito: quella scelta in admin, altrimenti ricavata dagli stati dei tornei. */
export function useSiteMode(): SiteMode {
  const { config } = useSiteConfig();
  const { tournaments } = useTournamentsRegistry();
  return config.mode ?? globalMode(tournaments.map((t) => t.data));
}
