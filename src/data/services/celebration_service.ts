/**
 * data/services/celebration_service — confetti, kept out of the view models so
 * the domain rule "a perfect day is worth celebrating" stays testable.
 */
import confetti from 'canvas-confetti';

type Fire = ReturnType<typeof confetti.create>;

const BURSTS = [
  { particleCount: 90, spread: 70, origin: { x: 0.5, y: 0.7 } },
  { particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } },
  { particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } },
];

export class CelebrationService {
  #fire: Fire | null = null;

  /** The canvas is owned by React; the service only borrows it. */
  attach(canvas: HTMLCanvasElement | null): void {
    this.#fire = canvas ? confetti.create(canvas, { resize: true, useWorker: false }) : null;
  }

  celebrate(): void {
    const fire = this.#fire;
    if (!fire) return;
    BURSTS.forEach((burst) => void fire({ ...burst, disableForReducedMotion: true }));
  }
}
