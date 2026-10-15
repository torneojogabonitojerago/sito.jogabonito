import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertPrimitive from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================
   Mattoncini grafici dell'area organizzatori
   ============================================================ */

export const inputCls =
  'w-full rounded-[10px] border border-white/[0.12] bg-[#0a0a0a] px-3.5 py-3 text-[15px] font-semibold text-white outline-none transition-[border-color,box-shadow] [color-scheme:dark] placeholder:font-normal placeholder:text-zinc-600 focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,0,255,0.18)]';

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="label-xs">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, className)} />;
}

export function SelectInput({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, className)} />;
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(inputCls, 'resize-y font-[inherit]', className)} />;
}

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'quiet';

const btnVariant: Record<BtnVariant, string> = {
  primary:
    'border-transparent bg-gradient-to-r from-primary to-cyan-500 text-white shadow-[0_0_24px_rgba(255,0,255,0.3)] hover:shadow-[0_0_36px_rgba(255,0,255,0.5)]',
  ghost: 'border-white/15 text-zinc-200 hover:border-primary hover:text-primary',
  danger: 'border-red-500/40 text-red-400 hover:bg-red-500/10',
  quiet: 'border-transparent text-zinc-400 hover:text-white',
};

export function Btn({
  variant = 'ghost',
  small,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; small?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border font-display uppercase tracking-[0.1em] transition-[color,background-color,border-color,box-shadow] disabled:pointer-events-none disabled:opacity-50',
        small ? 'px-3.5 py-2 text-xs' : 'px-5 py-2.5 text-sm',
        btnVariant[variant],
        className,
      )}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-white/[0.08] bg-[#101010] p-5 sm:p-6', className)}>{children}</div>
  );
}

export function CardTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-display text-[22px] uppercase leading-none text-white">{children}</h3>
      {aside}
    </div>
  );
}

/** Gruppo di pulsanti a pillola, uno solo attivo. */
export function PillGroup<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { id: T; label: ReactNode }[];
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-wrap gap-1 rounded-full border border-white/[0.08] bg-[#0a0a0a] p-1', className)}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors',
            value === o.id ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Interruttore aperto/chiuso. */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center gap-3 text-sm font-semibold text-zinc-300"
    >
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          on ? 'border-green-500/60 bg-green-500/30' : 'border-white/15 bg-white/5',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all',
            on ? 'left-[22px] bg-green-400' : 'left-0.5 bg-zinc-500',
          )}
        />
      </span>
      {label}
    </button>
  );
}

/* ---------- finestra modale ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[101] flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] border border-primary/40 bg-[#0c0c0c] shadow-[0_0_80px_rgba(255,0,255,0.2)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            wide ? 'max-w-[640px]' : 'max-w-[480px]',
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-6 py-4">
            <DialogPrimitive.Title className="font-display text-2xl uppercase leading-none text-white">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Chiudi"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-2.5 border-t border-white/[0.08] px-6 py-4">{footer}</div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ---------- conferme (al posto di window.confirm) ---------- */

interface ConfirmOptions {
  title: string;
  message?: string;
  action?: string;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmCtx = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOpts(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <AlertPrimitive.Root open={Boolean(opts)} onOpenChange={(v) => !v && close(false)}>
        <AlertPrimitive.Portal>
          <AlertPrimitive.Overlay className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm" />
          <AlertPrimitive.Content className="fixed left-1/2 top-1/2 z-[111] w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-red-500/40 bg-[#0c0c0c] p-6 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
            <AlertPrimitive.Title className="font-display text-2xl uppercase leading-tight text-white">
              {opts?.title}
            </AlertPrimitive.Title>
            <AlertPrimitive.Description className="mt-2 text-[15px] leading-normal text-zinc-400">
              {opts?.message ?? 'Questa operazione non si può annullare.'}
            </AlertPrimitive.Description>
            <div className="mt-6 flex flex-wrap justify-end gap-2.5">
              <AlertPrimitive.Cancel asChild>
                <Btn variant="ghost">Annulla</Btn>
              </AlertPrimitive.Cancel>
              <AlertPrimitive.Action asChild>
                <Btn
                  className="border-transparent bg-red-500 text-white hover:bg-red-600 hover:text-white"
                  onClick={() => close(true)}
                >
                  {opts?.action ?? 'Elimina'}
                </Btn>
              </AlertPrimitive.Action>
            </div>
          </AlertPrimitive.Content>
        </AlertPrimitive.Portal>
      </AlertPrimitive.Root>
    </ConfirmCtx.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm deve essere usato dentro <ConfirmProvider>');
  return ctx;
}
