/**
 * Splash — shown while the design-language chunk loads (they are code-split,
 * so a browser tab never downloads Framework7 and an installed Android user
 * never downloads Fluent).
 */
const BRAND = '#0057ff';

const styles = {
  screen: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    background: BRAND,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: 600, letterSpacing: 0.2, color: BRAND },
};

export default function Splash() {
  return (
    <div style={styles.screen} role="status" aria-label="Loading Streaks">
      <div style={styles.badge}>
        <svg viewBox="0 0 512 512" width="48" height="48" aria-hidden="true">
          <path
            d="M256 96c40 64 88 104 88 200a88 88 0 0 1-176 0c0-48 32-72 48-112 8 24 20 36 32 40 8-32 8-80 8-128z"
            fill="#ffffff"
          />
          <path
            d="M216 300l30 30 54-58"
            fill="none"
            stroke={BRAND}
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={styles.title}>Streaks</div>
    </div>
  );
}
