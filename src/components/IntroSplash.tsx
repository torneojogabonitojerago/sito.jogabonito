import { useEffect, useState, type CSSProperties } from 'react';

/* Intro animata all'apertura del sito: una volta per sessione, si salta con un click,
   non parte se l'utente ha chiesto di ridurre le animazioni. Durata ~3,75s. */

const SEEN_KEY = 'jb-intro-seen';
/* di norma si chiude a fine animazione; il timer è solo una rete di sicurezza */
const FALLBACK_MS = 6000;

function shouldShow(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage non disponibile */
  }
}

const anim = (name: string, dur: number, delay: number, ease = 'cubic-bezier(.2,.8,.2,1)') =>
  `${name} ${dur}s ${ease} ${delay}s both`;

function Ring({ color, delay, width }: { color: string; delay: number; width: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        borderRadius: '50%',
        border: `${width}px solid ${color}`,
        boxShadow: `0 0 40px ${color}, inset 0 0 40px ${color}`,
        animation: anim('jb-i-ring', 1.3, delay, 'cubic-bezier(.1,.7,.3,1)'),
      }}
    />
  );
}

function Beam({ top, color, delay, reverse }: { top: string; color: string; delay: number; reverse?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        height: 2,
        background: `linear-gradient(90deg,transparent,${color},transparent)`,
        boxShadow: `0 0 18px ${color}`,
        transformOrigin: reverse ? 'right' : 'left',
        animation: anim('jb-i-beam', 0.9, delay, 'ease-out'),
      }}
    />
  );
}

function Word({ text, color, start, glow }: { text: string; color: string; start: number; glow: string }) {
  return (
    <>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            color,
            textShadow: glow,
            animation: anim('jb-i-letter', 0.55, start + i * 0.04),
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  );
}

const gridStyle: CSSProperties = {
  position: 'absolute',
  left: '-50%',
  right: '-50%',
  bottom: '-30%',
  height: '80%',
  backgroundImage:
    'linear-gradient(rgba(255,0,255,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,.25) 1px,transparent 1px)',
  backgroundSize: '44px 44px',
  transformOrigin: 'bottom',
  maskImage: 'linear-gradient(to top,#000,transparent)',
  WebkitMaskImage: 'linear-gradient(to top,#000,transparent)',
  animation: anim('jb-i-grid', 3.2, 0, 'linear'),
};

const sweepStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,.55) 50%,transparent 60%)',
  backgroundSize: '250% 100%',
  backgroundRepeat: 'no-repeat',
  mixBlendMode: 'screen',
  borderRadius: '50%',
  maskImage: 'radial-gradient(circle,#000 58%,transparent 70%)',
  WebkitMaskImage: 'radial-gradient(circle,#000 58%,transparent 70%)',
  animation: anim('jb-i-sweep', 1.1, 1.75, 'ease-in-out'),
};

export default function IntroSplash() {
  const [visible, setVisible] = useState(shouldShow);

  useEffect(() => {
    if (!visible) return;
    markSeen();
    const t = setTimeout(() => setVisible(false), FALLBACK_MS);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      onClick={() => setVisible(false)}
      onAnimationEnd={(e) => {
        if (e.animationName === 'jb-i-out') setVisible(false);
      }}
      className="fixed inset-0 z-[500] flex cursor-pointer items-center justify-center overflow-hidden bg-black"
      style={{ animation: anim('jb-i-out', 0.65, 3.05, 'cubic-bezier(.7,0,.2,1)') }}
    >
      <div style={gridStyle} />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 45%,rgba(255,0,255,.35),rgba(0,255,255,.12) 35%,transparent 65%)',
          animation: anim('jb-i-flash', 2.4, 0.1, 'ease-out'),
        }}
      />
      <Beam top="30%" color="#ff00ff" delay={0.15} />
      <Beam top="70%" color="#00ffff" delay={0.3} reverse />
      <Beam top="50%" color="#ffffff" delay={0.55} />

      <div
        className="relative flex flex-col items-center gap-[18px]"
        style={{ animation: anim('jb-i-shake', 2.2, 0, 'linear') }}
      >
        <div className="relative aspect-square w-[min(62vw,320px)]">
          <Ring color="#ff00ff" delay={0.95} width={3} />
          <Ring color="#00ffff" delay={1.1} width={2} />
          <Ring color="#ffffff" delay={1.28} width={1} />
          <div className="absolute inset-0" style={{ animation: anim('jb-i-logo', 1.5, 0.05) }}>
            <div
              className="absolute -inset-[18%] rounded-full blur-[20px]"
              style={{
                background: 'radial-gradient(circle,rgba(255,0,255,.45),rgba(0,255,255,.18) 45%,transparent 70%)',
                animation: 'jb-i-pulse 1.6s ease-in-out 1.2s infinite',
              }}
            />
            <img src="/logo.png" alt="Joga Bonito" className="relative h-full w-full object-contain mix-blend-screen" />
            <div style={sweepStyle} />
          </div>
        </div>

        <div className="flex flex-wrap justify-center overflow-hidden py-1 font-display text-[clamp(34px,6vw,64px)] leading-none tracking-[0.04em]">
          <Word text="TORNEO " color="#fff" start={1.3} glow="0 0 14px rgba(255,0,255,.6)" />
          <Word text="JOGABONITO" color="#ff00ff" start={1.58} glow="0 0 22px rgba(255,0,255,.8)" />
        </div>

        <div
          className="-mt-2 font-brush text-[clamp(34px,5vw,52px)] font-bold text-cyan-400"
          style={{
            textShadow: '0 0 18px rgba(0,255,255,.7)',
            animation: anim('jb-i-pop', 0.6, 2.15, 'cubic-bezier(.3,1.6,.5,1)'),
          }}
        >
          O PINGI O STAI A CASA!
        </div>
      </div>

      <span className="absolute bottom-6 right-7 text-xs font-bold uppercase tracking-[0.24em] text-zinc-600">
        Tocca per saltare
      </span>
    </div>
  );
}
