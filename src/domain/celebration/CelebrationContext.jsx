import confetti from 'canvas-confetti';
import { createContext, useCallback, useContext, useMemo, useRef } from 'react';

const CelebrationContext = createContext(null);

const BURSTS = [
  { particleCount: 90, spread: 70, origin: { x: 0.5, y: 0.7 } },
  { particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } },
  { particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } },
];

export function CelebrationProvider({ children }) {
  const fireRef = useRef(null);

  const register = useCallback((canvas) => {
    fireRef.current = canvas ? confetti.create(canvas, { resize: true, useWorker: false }) : null;
  }, []);

  const celebrate = useCallback(() => {
    const fire = fireRef.current;
    if (!fire) return;
    BURSTS.forEach((burst) => fire({ ...burst, disableForReducedMotion: true }));
  }, []);

  const value = useMemo(() => ({ celebrate, register }), [celebrate, register]);
  return <CelebrationContext.Provider value={value}>{children}</CelebrationContext.Provider>;
}

function useCelebrationContext() {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error('useCelebration must be used within <CelebrationProvider>');
  return ctx;
}

export function useCelebration() {
  const { celebrate } = useCelebrationContext();
  return { celebrate };
}

const canvasStyle = {
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
