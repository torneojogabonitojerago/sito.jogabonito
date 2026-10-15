import { useState } from 'react';
import { Link } from 'react-router';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputCls } from './ui';

const ADMIN_CODE = 'patronale2026';
const SESSION_KEY = 'torneo-admin-ok';

export function isAdminUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function lockAdmin() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage non disponibile */
  }
}

export default function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* resta sbloccato solo finché la pagina è aperta */
      }
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-[20px] border border-primary/40 bg-[linear-gradient(160deg,rgba(0,0,0,0.9),rgba(25,0,25,0.85))] p-8 text-center shadow-[0_0_80px_rgba(255,0,255,0.15)]"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/[0.12] text-primary">
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="font-display mt-5 text-3xl uppercase leading-none text-white">Area organizzatori</h1>
        <p className="font-brush mt-2 text-2xl text-cyan-400">solo per lo staff</p>
        <input
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          placeholder="Codice di accesso"
          aria-label="Codice di accesso"
          autoFocus
          className={cn(inputCls, 'mt-6 text-center tracking-[0.3em]', error && 'border-red-500')}
        />
        {error && <p className="mt-2 text-sm font-semibold text-red-400">Codice errato</p>}
        <button type="submit" className="btn-neon mt-5 w-full py-3.5 text-base">
          Entra
        </button>
        <Link
          to="/"
          className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-primary"
        >
          ← Torna al sito
        </Link>
      </form>
    </div>
  );
}
