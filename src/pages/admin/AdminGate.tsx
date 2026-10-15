import { useState } from 'react';
import { Link } from 'react-router';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_CODE = 'patronale2026';
const SESSION_KEY = 'torneo-admin-ok';

export const inputCls =
  'w-full rounded-sm border border-white/10 bg-black/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-primary [color-scheme:dark]';

export function isAdminUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export default function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-md border border-white/10 bg-[#101010] p-8 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-primary/15 text-primary">
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="font-display mt-4 text-2xl uppercase tracking-wide text-white">Area Organizzatori</h1>
        <p className="mt-1 text-sm text-zinc-500">Inserisci il codice per accedere</p>
        <input
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          placeholder="Codice di accesso"
          autoFocus
          className={cn(inputCls, 'mt-6 text-center tracking-[0.3em]', error && 'border-red-500')}
        />
        {error && <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-red-500">Codice errato</p>}
        <button
          type="submit"
          className="font-display mt-5 w-full rounded-sm bg-primary px-4 py-3 text-sm uppercase tracking-widest text-white transition-transform hover:scale-[1.02]"
        >
          Entra
        </button>
        <Link to="/" className="mt-4 inline-block text-xs uppercase tracking-widest text-zinc-600 hover:text-primary">
          ← Torna al sito
        </Link>
      </form>
    </div>
  );
}
