/**
 * Cross-cutting delight: a confetti canvas owned at the app root and shared by
 * every UI kit. Domain code fires celebrate() without knowing which UI is
 * mounted — one example of the domain layer staying UI-agnostic.
 */
import confetti from 'canvas-confetti';
import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

type Burst = Parameters<typeof confetti>[0] & Record<string, unknown>;

interface CelebrationApi {
  celebrate(): void;
  register(canvas: HTMLCanvasElement | null): void;
}

const CelebrationContext = createContext<CelebrationApi | null>(null);

const BURSTS: Burst[] = [
  { particleCount: 90, spread: 70, origin: { x: 0.5, y: 0.7 } },
  { particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } },
  { particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } },
];

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const fireRef = useRef<ReturnType<typeof confetti.create> | null>(null);

  const register = useCallback((canvas: HTMLCanvasElement | null): void => {
    fireRef.current = canvas ? confetti.create(canvas, { resize: true, useWorker: false }) : null;
  }, []);

  const celebrate = useCallback((): void => {
    const fire = fireRef.current;
    if (!fire) return;
    BURSTS.forEach((burst) => fire({ ...burst, disableForReducedMotion: true }));
  }, []);

  const value = useMemo<CelebrationApi>(() => ({ celebrate, register }), [celebrate, register]);
  return <CelebrationContext.Provider value={value}>{children}</CelebrationContext.Provider>;
}

function useCelebrationContext(): CelebrationApi {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error('useCelebration must be used within <CelebrationProvider>');
  return ctx;
}

export function useCelebration(): { celebrate: () => void } {
  const { celebrate } = useCelebrationContext();
  return { celebrate };
}

const canvasStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 100000,
};

export function ConfettiCanvas() {
  const { register } = useCelebrationContext();
  return <canvas ref={register} style={canvasStyle} aria-hidden="true" />;
}
