import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Estrae un messaggio leggibile da un errore intercettato. Gli errori di
 * Supabase (PostgrestError, incluse le eccezioni sollevate dentro le RPC)
 * non sono istanze di `Error` a runtime — hanno solo una proprietà
 * `message` — quindi un semplice `err instanceof Error` li lascia passare
 * e nasconde il messaggio vero dietro il fallback generico.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  return fallback
}
