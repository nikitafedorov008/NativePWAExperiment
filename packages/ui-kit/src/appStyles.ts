/**
 * appStyles.ts — the kit's single custom-stylesheet file.
 *
 * The engines ship their own styling (Framework7's CSS bundle, Fluent's
 * CSS-in-JS) and the code kit styles itself inline from theme.tsx. What is
 * left — habit check circles, week strips, emoji grids, stat tiles — lives
 * here, injected as one <style> element. Every rule is scoped under its kit
 * root (.framework7-root / .fluent-app) so design languages cannot leak into
 * each other. Importing this module is idempotent.
 */

const F7_HABIT_STYLES = `
/* Framework7 (Cupertino & Material): habit check circle, week strip, emoji grid,
   stat tiles. Written against F7 CSS variables, so both themes and dark mode work. */
.framework7-root .list ul .item-inner { flex-wrap: wrap; }
.framework7-root .habit-item .item-inner { align-content: center; }
.framework7-root .habit-item .item-media { align-self: flex-start; margin-top: 14px; }

.framework7-root .habit-check {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid var(--f7-theme-color);
  background: transparent; color: transparent;
  display: flex; align-items: center; justify-content: center;
  padding: 0; flex-shrink: 0; cursor: pointer;
}
.framework7-root .habit-check.done { background: var(--f7-theme-color); color: var(--f7-on-theme-color, #fff); }
.framework7-root .habit-check .f7-icons, .framework7-root .habit-check .material-icons { font-size: 17px; line-height: 1; }

.framework7-root .habit-name {
  display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;
  background: none; border: 0; padding: 0; font: inherit; color: inherit;
  text-align: inherit; cursor: pointer;
}
.framework7-root .habit-emoji { font-size: 22px; line-height: 1; }
.framework7-root .habit-name-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.framework7-root .habit-after { display: flex; align-items: center; gap: 4px; }
.framework7-root .habit-after .badge { font-variant-numeric: tabular-nums; }
.framework7-root .habit-icon-btn { color: var(--f7-text-color); opacity: 0.45; }
.framework7-root .habit-icon-btn .f7-icons, .framework7-root .habit-icon-btn .material-icons { font-size: 21px; width: 21px; }

.framework7-root .habit-week { width: 100%; margin-top: 12px; }
.framework7-root .habit-week-wrap { width: 100%; display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.framework7-root .habit-sub { font-size: 13px; opacity: 0.55; font-variant-numeric: tabular-nums; }
.framework7-root .habit-emoji-lg { font-size: 24px; width: 36px; text-align: center; }

.framework7-root .week-dots { display: flex; gap: 6px; justify-content: space-between; width: 100%; }
.framework7-root .week-col { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
.framework7-root .week-wd { font-size: 9px; text-transform: uppercase; opacity: 0.5; letter-spacing: 0.3px; line-height: 1; }
.framework7-root .week-wd.today { opacity: 1; font-weight: 600; }
.framework7-root .week-dot {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid var(--f7-list-item-border-color, rgba(0, 0, 0, 0.15));
  background: transparent; color: var(--f7-text-color);
  font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums; font-family: inherit;
  display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer;
}
.framework7-root .week-dot.done { background: var(--f7-theme-color); border-color: var(--f7-theme-color); color: var(--f7-on-theme-color, #fff); }
.framework7-root .week-dot.today { border-width: 2px; border-color: var(--f7-text-color); font-weight: 600; }
.framework7-root .week-dot.today.done { border-color: var(--f7-theme-color); }

.framework7-root .today-progress-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 10px; }
.framework7-root .today-progress-num { font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums; }
.framework7-root .today-progress-num .muted { font-size: 16px; font-weight: 400; opacity: 0.55; }
.framework7-root .today-progress-label { font-size: 13px; opacity: 0.55; }

.framework7-root .stats-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin: 8px calc(var(--f7-block-margin-horizontal) + var(--f7-safe-area-left)) 8px
    calc(var(--f7-block-margin-horizontal) + var(--f7-safe-area-right));
}
.framework7-root .stat-tile {
  background: var(--f7-card-bg-color); border-radius: var(--f7-card-border-radius, 12px);
  padding: 14px 16px; min-width: 0;
}
.framework7-root .stat-value { font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.framework7-root .stat-label { font-size: 12px; opacity: 0.55; margin-top: 2px; }

.framework7-root .emoji-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 8px 0 4px; }
.framework7-root .emoji-btn {
  aspect-ratio: 1; font-size: 22px; border-radius: 10px;
  border: 1px solid var(--f7-list-item-border-color, rgba(0, 0, 0, 0.15));
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 0;
}
.framework7-root .emoji-btn.selected {
  border-color: var(--f7-theme-color);
  background: color-mix(in srgb, var(--f7-theme-color) 14%, transparent);
}

.framework7-root .empty-hint { text-align: center; opacity: 0.55; padding: 20px 0; font-size: 14px; }
.framework7-root .install-steps-title { font-weight: 600; margin: 0; }
.framework7-root .install-steps { margin: 8px 0 0; padding-left: 20px; opacity: 0.7; }
`;

const FLUENT_APP_STYLES = `
/* Fluent UI (Windows): app shell and the habit widgets. Colors come from Fluent
   design tokens, which is why light and dark need no separate rules here. */
.fluent-app { display: flex; flex-direction: column; min-height: 100vh; }
.fluent-app .fluent-topbar {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 10px 24px; padding-top: calc(10px + env(safe-area-inset-top));
  border-bottom: 1px solid var(--colorNeutralStroke2);
  position: sticky; top: 0; background: var(--colorNeutralBackground1); z-index: 10;
}
.fluent-app .fluent-main {
  flex: 1; width: 100%; max-width: 860px; margin: 0 auto;
  padding: 24px 16px 48px; padding-bottom: calc(48px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.fluent-app .fluent-screen { display: flex; flex-direction: column; gap: 16px; }
.fluent-app .fluent-screen-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}

.fluent-app .tiles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.fluent-app .tile-value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.fluent-app .habit-list { list-style: none; margin: 0; padding: 0; }
.fluent-app .habit-row { display: flex; flex-direction: column; gap: 10px; padding: 12px 0; }
.fluent-app .habit-row + .habit-row { border-top: 1px solid var(--colorNeutralStroke2); }
.fluent-app .habit-row-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
.fluent-app .habit-emoji { font-size: 22px; line-height: 1; }
.fluent-app .habit-name {
  background: none; border: 0; padding: 0; font: inherit; color: inherit; font-weight: 600;
  cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; min-width: 0; text-align: left;
}
.fluent-app .habit-sub { font-size: 12px; color: var(--colorNeutralForeground2); font-variant-numeric: tabular-nums; }

.fluent-app .week-dots { display: flex; gap: 6px; flex-wrap: wrap; }
.fluent-app .habit-week-dots { padding-left: 34px; }
.fluent-app .week-col { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.fluent-app .week-wd { font-size: 10px; text-transform: uppercase; color: var(--colorNeutralForeground3); line-height: 1; }
.fluent-app .week-wd.today { color: var(--colorNeutralForeground1); font-weight: 600; }
.fluent-app .week-dot {
  width: 26px; height: 26px; border-radius: 50%;
  border: 1px solid var(--colorNeutralStroke1);
  background: var(--colorNeutralBackground2); color: var(--colorNeutralForeground2);
  font-size: 11px; font-variant-numeric: tabular-nums; font-family: inherit;
  display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer;
}
.fluent-app .week-dot.done {
  background: var(--colorBrandBackground); border-color: var(--colorBrandBackground);
  color: var(--colorNeutralForegroundOnBrand);
}
.fluent-app .week-dot.today { border: 2px solid var(--colorNeutralForeground1); color: var(--colorNeutralForeground1); font-weight: 600; }
.fluent-app .week-dot.today.done { border-color: var(--colorBrandBackground); }

.fluent-app .emoji-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 44px)); gap: 8px; }
.fluent-app .emoji-btn {
  aspect-ratio: 1; font-size: 20px; border-radius: 6px;
  border: 1px solid var(--colorNeutralStroke1); background: var(--colorNeutralBackground1);
  cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;
}
.fluent-app .emoji-btn.selected { border-color: var(--colorBrandStroke1); background: var(--colorBrandBackground2); }

.fluent-app .form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.fluent-app .name-input { max-width: 320px; }

.fluent-app .info-list { margin: 0; padding: 0; }
.fluent-app .info-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 8px 0; }
.fluent-app .info-row + .info-row { border-top: 1px solid var(--colorNeutralStroke2); }
.fluent-app .info-row dt { color: var(--colorNeutralForeground2); font-size: 13px; }
.fluent-app .info-row dd { margin: 0; font-weight: 600; font-size: 13px; }

.fluent-app .install-steps { margin: 6px 0 0; padding-left: 20px; color: var(--colorNeutralForeground2); font-size: 13px; }
.fluent-app .destructive-text { color: var(--colorPaletteRedForeground1); }
`;

/** Injects the kit stylesheet once; safe to call from any entry point. */
export function injectAppStyles(): void {
  if (typeof document === 'undefined' || document.getElementById('app-styles')) return;
  const el = document.createElement('style');
  el.id = 'app-styles';
  el.textContent = F7_HABIT_STYLES + FLUENT_APP_STYLES;
  document.head.appendChild(el);
}
