/**
 * ui/core/widgets/confetti_canvas — the one piece of UI infrastructure the
 * domain needs. The canvas lives in React; the celebration service borrows it,
 * so view models can celebrate without touching the DOM.
 */
import type { CSSProperties } from 'react';
import { useServices } from '../../../app/services.tsx';

const canvasStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 100000,
};

export default function ConfettiCanvas() {
  const { celebration } = useServices();
  return <canvas ref={(canvas) => celebration.attach(canvas)} style={canvasStyle} aria-hidden="true" />;
}
